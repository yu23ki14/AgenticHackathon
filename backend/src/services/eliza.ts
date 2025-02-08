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
} from "@elizaos/core"
import Database from "better-sqlite3"
import { DEFAULT_CHARACTER } from "../lib/character.js"
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite"
import { Bot, Context } from "grammy"
import { MessageHandlerTemplate } from "../templates/telegram.js"
import { ElizaConversationService } from "./el/conversation.js"
import { sendFractionToken } from "../eliza/actions/sendFractionToken.js"
import { Message } from "grammy/types"

export class ElizaService {
  public runtime: AgentRuntime
  public telegramBot: Bot<Context>
  public conversationService: ElizaConversationService

  constructor(telegramBot: Bot<Context>) {
    this.telegramBot = telegramBot

    const db = new SqliteDatabaseAdapter(new Database("./eliza.sqlite"))

    db.init()

    this.runtime = new AgentRuntime({
      databaseAdapter: db,
      token: process.env.OPENAI_API_KEY || "",
      modelProvider: DEFAULT_CHARACTER.modelProvider,
      character: DEFAULT_CHARACTER,
      conversationLength: 4096,
      cacheManager: new CacheManager(new MemoryCacheAdapter()),
      logging: true,
      actions: [sendFractionToken],
    })

    const memory = new MemoryManager({
      tableName: "conversations",
      runtime: this.runtime,
    })

    this.runtime.registerMemoryManager(memory)

    this.conversationService = new ElizaConversationService(this)
  }

  public async generateResponse(ctx: Context) {
    console.log("Eliza command received")

    const message = ctx.message
    let messageText = ""
    if ("text" in message) {
      messageText = ctx.match as string
    } else if ("caption" in message && message.caption) {
      messageText = message.caption
    }

    console.log("Eliza message:", messageText)
    if (!messageText) return

    const content: Content = {
      text: messageText,
      source: "telegram",
    }

    const messageId = stringToUuid(
      message.message_id.toString() + "-" + this.runtime.agentId
    ) as UUID
    const userId = stringToUuid(ctx.from.id.toString())
    const roomId = stringToUuid(
      ctx.chat.id.toString() + "-" + this.runtime.agentId
    )
    const agentId = this.runtime.agentId

    const state = await this.updateState(
      messageId,
      agentId,
      userId,
      roomId,
      content,
      message
    )

    const context = composeContext({
      state,
      template: MessageHandlerTemplate,
    })

    console.log("Eliza context:", state.recentMessages)

    const response = await generateText({
      runtime: this.runtime,
      context,
      modelClass: ModelClass.MEDIUM,
    })

    await this.runtime.processActions(
      {
        userId,
        roomId,
        agentId,
        content: { text: ctx.message.text },
      },
      [
        {
          agentId,
          roomId,
          userId,
          content: { text: response, action: response },
        },
      ],
      state
    )

    await this.updateState(
      messageId,
      agentId,
      userId,
      roomId,
      { text: response },
      message
    )

    await this.runtime.databaseAdapter.log({
      body: { message, context, response },
      userId,
      roomId,
      type: "response",
    })

    this.telegramBot.api.sendMessage(ctx.chat.id, response)
  }

  private async updateState(
    messageId: UUID,
    agentId: UUID,
    userId: UUID,
    roomId: UUID,
    content: Content,
    message: Message
  ) {
    const memory = await this.runtime.messageManager.addEmbeddingToMemory({
      id: messageId,
      agentId: agentId,
      userId,
      roomId,
      content,
      createdAt: message.date * 1000,
    })
    await this.runtime.messageManager.createMemory(memory, true)

    let state = await this.runtime.composeState(memory)
    state = await this.runtime.updateRecentMessageState(state)

    return state
  }
}
