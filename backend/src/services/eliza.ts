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
import { MessageHandlerTemplate, TokenTransferProposalTemplate } from "../templates/telegram.js";

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
   * 会話データから、送信者と近しい会話（連続して発言が交互に行われた回数）をカウントして、提案文を生成する
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

    // コマンド以外のメッセージのみ抽出
    const validMessages = messages.filter(m => !m.text.trim().startsWith("/"));
    // ソート（作成時刻順）
    validMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // 送信者は /suggest を発行したユーザー
    const sender = (ctx.from && ctx.from.username ? "@" + ctx.from.username : ctx.from.id.toString());

    // 送信者の直後に発言しているユーザーのインタラクション回数をカウント
    const interactions: { [uid: string]: number } = {};
    for (let i = 0; i < validMessages.length - 1; i++) {
      if (validMessages[i].user_id === sender) {
        const nextUser = validMessages[i + 1].user_id;
        if (nextUser !== sender) {
          interactions[nextUser] = (interactions[nextUser] || 0) + 1;
        }
      }
    }
    console.log("Interaction counts:", interactions);

    // Sender と近しい会話回数が最も多いユーザーを Receiver として選出
    let receiver = "";
    let bestCount = 0;
    for (const uid in interactions) {
      if (interactions[uid] > bestCount) {
        bestCount = interactions[uid];
        receiver = uid;
      }
    }
    // もし候補が存在しない場合は "Receiver" とする（デフォルト）
    if (!receiver) {
      receiver = "Receiver";
      bestCount = 1;
    }

    // tokenId は "General（トークン）" とする（実際はロール情報に基づく評価へ変更可能）
    const tokenId = "General";
    // amount は、送信者と Receiver 間の近しい会話回数をそのまま採用（必要に応じてスケール可能）
    const amount = bestCount;

    const proposal = `${sender}さん、日頃お世話になってる${receiver}さんに${tokenId}トークンを${amount}贈ってみるのはどうですか？`;
    return proposal;
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

    // ユーザーがBotの提案メッセージに返信して送金指示をしている場合
    if (ctx.message.reply_to_message && !messageText.startsWith("/")) {
      // 例: "0x12344を300だけ送りたい"
      const replyRegex = /^(.+?)を(\d+)だけ送りたい$/;
      const replyMatch = messageText.replace(/\s+/g, "").match(replyRegex);
      if (replyMatch && replyMatch.length === 3) {
        const userTokenId = replyMatch[1];
        const userAmount = replyMatch[2];
        const suggestionText = ctx.message.reply_to_message.text;
        const proposalRegex = /^(.+?)さん、日頃お世話になってる(.+?)さんに(.+?)トークンを(.+?)贈ってみるのはどうですか？$/;
        const proposalMatch = suggestionText.replace(/\s+/g, "").match(proposalRegex);
        if (proposalMatch && proposalMatch.length === 5) {
          const senderId = proposalMatch[1];
          const receiverId = proposalMatch[2];
          console.log(`Token transfer initiated: from ${senderId}'s wallet to ${receiverId}'s wallet: ${userTokenId} ${userAmount}`);
          this.telegramBot.api.sendMessage(ctx.chat.id, `${senderId}のウォレットから${receiverId}のウォレットへ${userTokenId}を${userAmount}送金手続きを開始します。`);
          this.lastProposal = null;
          return;
        } else {
          this.telegramBot.api.sendMessage(ctx.chat.id, "提案内容の解析に失敗しました。");
          return;
        }
      }
    }

    // /suggest コマンドの場合の処理
    if (messageText.toLowerCase().startsWith("/suggest")) {
      console.log("Processing /suggest command");
      const roomId = stringToUuid(ctx.chat.id.toString() + "-" + this.runtime.agentId);
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      // ① Eliza の長期記憶からの会話データ取得
      const elizaMemories = await this.runtime.messageManager.getMemories({
        roomId,
        start: weekAgo,
      });
      console.log("Eliza memories retrieved count:", elizaMemories.length);
      const aggregatedText1 = elizaMemories.map((m) => m.content.text).join("\n");

      // ② telegram_message.sqlite に保存されたグループ会話データ取得
      const messageRepo = AppDataSource.getRepository(Message);
      const conversationMessages = await messageRepo.find({
        where: {
          group_id: ctx.chat.id.toString(),
          created_at: MoreThan(new Date(weekAgo)),
        },
      });
      console.log("Conversation messages count:", conversationMessages.length);
      const aggregatedText2 = conversationMessages.map((m) => m.text).join("\n");

      // ③ 両方を連結して aggregatedText を作成
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

      // evaluateContributions で送信者と receiver を、近しい会話の数に基づいて評価
      const proposal = await this.evaluateContributions(ctx, weekAgo);
      console.log("Evaluation proposal:", proposal);
      this.lastProposal = proposal;

      // 最終出力は proposal 文字列のみ
      this.telegramBot.api.sendMessage(ctx.chat.id, proposal);
      return;
    }

    // 通常のメッセージの場合の処理：memory 登録と通常応答生成
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
