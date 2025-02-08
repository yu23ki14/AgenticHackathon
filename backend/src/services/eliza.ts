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
import { MessageHandlerTemplate, TokenTransferProposalTemplate } from "../templates/telegram.js";

export class ElizaService {
  public runtime: AgentRuntime;
  private telegramBot: Bot<Context>;

  constructor(telegramBot: Bot<Context>) {
    this.telegramBot = telegramBot;

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

  public async generateResponse(ctx: Context) {
    console.log("Eliza command received");

    const message = ctx.message;
    let messageText = "";

    if ("text" in message) {
      messageText = message.text.trim(); // 前後の空白を除去
    } else if ("caption" in message && message.caption) {
      messageText = message.caption.trim();
    }

    console.log("Extracted message text:", messageText);

    // コマンドとして認識するため、"/suggest" で始まる場合に処理する
    if (messageText.toLowerCase().startsWith("/suggest")) {
      console.log("Processing /suggest command");

      // ※ 通常の会話履歴の保存処理はこのコマンドでは行わず、専用の処理へ分岐する

      // 例：チャットIDとエージェントIDから一意な roomId を生成
      const roomId = stringToUuid(ctx.chat.id.toString() + "-" + this.runtime.agentId);

      // 過去1週間分のタイムスタンプを算出
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      // 過去1週間分の会話履歴（メモリ）を取得（start プロパティを使用）
      const memories = await this.runtime.messageManager.getMemories({
        roomId,
        start: weekAgo,
      });

      if (memories.length === 0) {
        console.log("No memories found for suggestion.");
        this.telegramBot.api.sendMessage(ctx.chat.id, "No conversation history available for suggestion.");
        return;
      }

      // 複数の Memory オブジェクトの content.text を連結して集約する
      const aggregatedText = memories.map((m) => m.content.text).join("\n");
      const aggregatedMemory = {
        // UUID形式にするため、"aggregated" という文字列を stringToUuid() で変換
        userId: stringToUuid("aggregated"),
        agentId: this.runtime.agentId,
        content: { text: aggregatedText, source: "aggregated" },
        roomId: roomId,
        createdAt: weekAgo, // 集約の開始時刻として weekAgo を設定
      };

      // composeState は単一の Memory を引数に取るので、aggregatedMemory を渡す
      let state = await this.runtime.composeState(aggregatedMemory);
      state = await this.runtime.updateRecentMessageState(state);

      // TokenTransferProposal 用テンプレートでコンテキストを生成
      const context = composeContext({
        state,
        template: TokenTransferProposalTemplate,
      });

      // AI による譲渡提案（JSON形式）を生成
      const suggestionResponse = await generateText({
        runtime: this.runtime,
        context,
        modelClass: ModelClass.MEDIUM,
      });

      // ログへの記録（オプション）
      await this.runtime.databaseAdapter.log({
        body: { message, context, suggestionResponse },
        userId: stringToUuid(ctx.from.id.toString()),
        roomId,
        type: "suggestion",
      });

      // Telegram に生成結果を返信
      this.telegramBot.api.sendMessage(ctx.chat.id, suggestionResponse);
      return;
    }

    // 通常のメッセージの場合の処理（従来のフロー）
    const content: Content = {
      text: messageText,
      source: "telegram",
    };

    const messageId = stringToUuid(
      message.message_id.toString() + "-" + this.runtime.agentId
    ) as UUID;
    const userId = stringToUuid(ctx.from.id.toString());
    const roomId = stringToUuid(ctx.chat.id.toString() + "-" + this.runtime.agentId);

    const memory = await this.runtime.messageManager.addEmbeddingToMemory({
      id: messageId,
      agentId: this.runtime.agentId,
      userId,
      roomId,
      content,
      createdAt: message.date * 1000,
    });
    await this.runtime.messageManager.createMemory(memory, true);

    let state = await this.runtime.composeState(memory);
    state = await this.runtime.updateRecentMessageState(state);

    const context = composeContext({
      state,
      template: MessageHandlerTemplate,
    });

    const response = await generateText({
      runtime: this.runtime,
      context,
      modelClass: ModelClass.MEDIUM,
    });

    await this.runtime.databaseAdapter.log({
      body: { message, context, response },
      userId,
      roomId,
      type: "response",
    });

    this.telegramBot.api.sendMessage(ctx.chat.id, response);
  }
}

