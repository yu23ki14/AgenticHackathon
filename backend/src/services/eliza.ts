import {
  AgentRuntime,
  CacheManager,
  composeContext,
  Content,
  generateText,
  MemoryCacheAdapter,
  MemoryManager,
  ModelClass,
  stringToUuid,
  UUID,
} from "@elizaos/core";
import Database from "better-sqlite3";
import { DEFAULT_CHARACTER } from "../lib/character.js";
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite";
import { Bot, Context } from "grammy";
import { AppDataSource } from "../lib/data-source.js";
import { Message } from "../model/Message.js";
import { MoreThan } from "typeorm";
import {
  MessageHandlerTemplate,
  TokenTransferProposalTemplate,
  TokenTransferConfirmationTemplate,
} from "../templates/telegram.js";

export class ElizaService {
  public runtime: AgentRuntime;
  private telegramBot: Bot<Context>;
  private lastProposal: string | null = null;

  constructor(telegramBot: Bot<Context>) {
    this.telegramBot = telegramBot;

    // 長期記憶用DB（eliza.sqlite）を使用
    const db = new SqliteDatabaseAdapter(new Database("./eliza.sqlite"));
    db.init();

    this.runtime = new AgentRuntime({
      databaseAdapter: db,
      token: process.env.OPENAI_API_KEY || "",
      modelProvider: DEFAULT_CHARACTER.modelProvider,
      character: DEFAULT_CHARACTER,
      conversationLength: 4096,
      cacheManager: new CacheManager(new MemoryCacheAdapter()),
      logging: true,
    });

    const memory = new MemoryManager({
      tableName: "conversations",
      runtime: this.runtime,
    });
    this.runtime.registerMemoryManager(memory);
  }

  /**
   * 通常のメッセージを AgentRuntime の memory に登録する
   * ※ コマンド（先頭が "/"）は対象外とする
   */
  public async processMessage(ctx: Context): Promise<void> {
    const message = ctx.message;
    let messageText = "";
    if ("text" in message) {
      messageText = message.text.trim();
    } else if ("caption" in message && message.caption) {
      messageText = message.caption.trim();
    }
    if (messageText.startsWith("/")) return;

    const content: Content = { text: messageText, source: "telegram" };
    const messageId = stringToUuid(message.message_id.toString() + "-" + this.runtime.agentId) as UUID;
    const userId = stringToUuid(ctx.from.id.toString());
    const roomId = stringToUuid(ctx.chat.id.toString() + "-" + this.runtime.agentId);

    const mem = await this.runtime.messageManager.addEmbeddingToMemory({
      id: messageId,
      agentId: this.runtime.agentId,
      userId,
      roomId,
      content,
      createdAt: message.date * 1000,
    });
    await this.runtime.messageManager.createMemory(mem, true);
  }

  /**
   * Evaluate contributions via LLM inference using TokenTransferProposalTemplate.
   * Retrieves conversation data from telegram_message.sqlite, converts it to JSON,
   * and embeds it into the template via the {{formattedConversation}} placeholder.
   * LLM is instructed to output XML-tagged result.
   */
  private async evaluateContributions(ctx: Context, weekAgo: number): Promise<string> {
    const messageRepo = AppDataSource.getRepository(Message);
    const messages = await messageRepo.find({
      where: {
        group_id: ctx.chat.id.toString(),
        created_at: MoreThan(new Date(weekAgo)),
      },
    });
    console.log("Total conversation messages:", messages.length);

    // コマンド以外のメッセージを抽出し、作成時刻順にソート
    const validMessages = messages.filter(m => !m.text.trim().startsWith("/"));
    validMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // 必要なフィールドのみ抽出して JSON 形式に変換
    const conversationData = validMessages.map(m => ({
      user_id: m.user_id,
      text: m.text,
      created_at: m.created_at
    }));
    const conversationJson = JSON.stringify(conversationData, null, 2);

    // Sender: /suggest を発行したユーザー (usernameがあれば "@"付き)
    const sender = (ctx.from && ctx.from.username ? "@" + ctx.from.username : ctx.from.id.toString());

    const additionalPlaceholders = {
      formattedConversation: conversationJson
    };

    // aggregatedMemory: 連結された有効なメッセージテキスト
    const aggregatedText = validMessages.map(m => m.text).join("\n");
    const roomId = stringToUuid(ctx.chat.id.toString() + "-" + this.runtime.agentId);
    const aggregatedMemory = {
      userId: stringToUuid("aggregated"),
      agentId: this.runtime.agentId,
      content: { text: aggregatedText, source: "aggregated" },
      roomId: roomId,
      createdAt: weekAgo,
    };

    let state = await this.runtime.composeState(aggregatedMemory);
    state = await this.runtime.updateRecentMessageState(state);

    // Compose context using TokenTransferProposalTemplate and embed conversation JSON
    const context = composeContext({
      state,
      template: TokenTransferProposalTemplate,
      ...additionalPlaceholders,
    });

    // LLM 推論を実行してXML形式の提案文を生成
    const proposalResponse = await generateText({
      runtime: this.runtime,
      context,
      modelClass: ModelClass.MEDIUM,
    });
    console.log("LLM Proposal response:", proposalResponse);
    return proposalResponse;
  }

  /**
   * Helper: Extract the value of a specified XML tag.
   */
  private extractTagValue(input: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'i');
    const match = input.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Interpret the user's reply for token transfer confirmation using LLM.
   */
  private async interpretConfirmation(userReply: string): Promise<{ action: string, tokenId?: string, amount?: number }> {
    const confirmationContext = composeContext({
      template: TokenTransferConfirmationTemplate,
      userReply: userReply,
    } as any);
    const confirmationResult = await generateText({
      runtime: this.runtime,
      context: confirmationContext,
      modelClass: ModelClass.MEDIUM,
    });
    console.log("LLM Confirmation result:", confirmationResult);
    try {
      const resultObj = JSON.parse(confirmationResult);
      return resultObj;
    } catch (e) {
      console.error("Error parsing confirmation result:", e);
      return { action: "cancel" };
    }
  }

  public async generateResponse(ctx: Context) {
    console.log("Eliza command received");
    const message = ctx.message;
    let messageText = "";
    if ("text" in message) {
      messageText = message.text.trim();
    } else if ("caption" in message && message.caption) {
      messageText = message.caption.trim();
    }
    console.log("Extracted message text:", messageText);

    // ① ユーザーがBotの提案メッセージに返信して送金指示を出す場合
    if (ctx.message.reply_to_message && messageText.includes("送りたい")) {
      const confirmationData = await this.interpretConfirmation(messageText);
      if (confirmationData.action === "transfer") {
        const userTokenId = confirmationData.tokenId;
        const userAmount = confirmationData.amount;
        // 提案メッセージのXMLから sender と receiver を抽出
        const suggestionText = ctx.message.reply_to_message.text;
        const extractedReceiver = this.extractTagValue(suggestionText, "receiverUserId");
        // sender は必ず /suggest を発行したユーザーの実際の username で上書き
        const actualSender = (ctx.from && ctx.from.username ? "@" + ctx.from.username : ctx.from.id.toString());
        if (actualSender && extractedReceiver && userTokenId && userAmount) {
          console.log(`Token transfer initiated: from ${actualSender} to ${extractedReceiver}: ${userTokenId} ${userAmount}`);
          const output = {
            senderUserId: actualSender,
            receiverUserId: extractedReceiver,
            tokenId: userTokenId,
            amount: Number(userAmount)
          };
          this.telegramBot.api.sendMessage(ctx.chat.id, JSON.stringify(output));
          this.lastProposal = null;
          return;
        } else {
          this.telegramBot.api.sendMessage(ctx.chat.id, "提案内容の抽出に失敗しました。");
          return;
        }
      } else {
        this.telegramBot.api.sendMessage(ctx.chat.id, "送金提案はキャンセルされました。");
        this.lastProposal = null;
        return;
      }
    }

    // ② /suggest コマンドの場合の処理
    if (messageText.toLowerCase().startsWith("/suggest")) {
      console.log("Processing /suggest command");
      const roomId = stringToUuid(ctx.chat.id.toString() + "-" + this.runtime.agentId);
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      // 長期記憶からの会話データ取得
      const elizaMemories = await this.runtime.messageManager.getMemories({
        roomId,
        start: weekAgo,
      });
      console.log("Eliza memories retrieved count:", elizaMemories.length);
      const aggregatedText1 = elizaMemories.map(m => m.content.text).join("\n");

      // telegram_message.sqlite に保存されたグループ会話データ取得
      const messageRepo = AppDataSource.getRepository(Message);
      const conversationMessages = await messageRepo.find({
        where: {
          group_id: ctx.chat.id.toString(),
          created_at: MoreThan(new Date(weekAgo)),
        },
      });
      console.log("Conversation messages count:", conversationMessages.length);
      const aggregatedText2 = conversationMessages.map(m => m.text).join("\n");

      // 両方を連結して aggregatedText を作成
      const aggregatedText = aggregatedText1 + "\n" + aggregatedText2;
      const aggregatedMemory = {
        userId: stringToUuid("aggregated"),
        agentId: this.runtime.agentId,
        content: { text: aggregatedText, source: "aggregated" },
        roomId: roomId,
        createdAt: weekAgo,
      };

      let state = await this.runtime.composeState(aggregatedMemory);
      state = await this.runtime.updateRecentMessageState(state);

      const proposalXml = await this.evaluateContributions(ctx, weekAgo);
      console.log("LLM Proposal XML:", proposalXml);
      this.lastProposal = proposalXml;

      // XMLから各タグ値を抽出
      const extractedSender = this.extractTagValue(proposalXml, "senderUserId");
      const assistCreditTokenId = this.extractTagValue(proposalXml, "assistCreditTokenId");
      const extractedReceiver = this.extractTagValue(proposalXml, "receiverUserId");
      const amountStr = this.extractTagValue(proposalXml, "amount");

      // sender は実際の /suggest 発行者で上書き
      const actualSender = (ctx.from && ctx.from.username ? "@" + ctx.from.username : ctx.from.id.toString());
      
      if (actualSender && assistCreditTokenId && extractedReceiver && amountStr) {
        const output = {
          senderUserId: actualSender,
          receiverUserId: extractedReceiver,
          tokenId: assistCreditTokenId,
          amount: Number(amountStr)
        };
        console.log("Final Proposal JSON:", output);
        const finalMessage = `${actualSender}さん、日頃お世話になってる${extractedReceiver}さんに${assistCreditTokenId}トークンを${amountStr}送りませんか？`;
        this.telegramBot.api.sendMessage(ctx.chat.id, finalMessage);


      } else {
        this.telegramBot.api.sendMessage(ctx.chat.id, "推論結果の抽出に失敗しました。");
      }
      return;
    }

    // ③ 通常のメッセージの場合の処理：memory 登録および通常応答生成
    await this.processMessage(ctx);
    const content: Content = { text: messageText, source: "telegram" };
    const messageId = stringToUuid(message.message_id.toString() + "-" + this.runtime.agentId) as UUID;
    const userId = stringToUuid(ctx.from.id.toString());
    const roomId = stringToUuid(ctx.chat.id.toString() + "-" + this.runtime.agentId);

    let state = await this.runtime.composeState({
      id: messageId,
      agentId: this.runtime.agentId,
      userId,
      roomId,
      content,
      createdAt: message.date * 1000,
    } as any);
    state = await this.runtime.updateRecentMessageState(state);

    const defaultContext = composeContext({
      state,
      template: MessageHandlerTemplate,
    });

    const response = await generateText({
      runtime: this.runtime,
      context: defaultContext,
      modelClass: ModelClass.MEDIUM,
    });

    await this.runtime.databaseAdapter.log({
      body: { message, context: defaultContext, response },
      userId,
      roomId,
      type: "response",
    });

    this.telegramBot.api.sendMessage(ctx.chat.id, response);
  }
}
