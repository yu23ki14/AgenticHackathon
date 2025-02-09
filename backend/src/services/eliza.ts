import {
  AgentRuntime,
  CacheManager,
  composeContext,
  Content,
  generateText,
  MemoryCacheAdapter,
  MemoryManager,
  ModelClass,
  State,
  stringToUuid,
  UUID,
} from "@elizaos/core"
import Database from "better-sqlite3"
import { DEFAULT_CHARACTER } from "../lib/character.js"
import { SqliteDatabaseAdapter } from "@elizaos/adapter-sqlite"
import { Bot, Context } from "grammy"
import { AppDataSource } from "../lib/data-source.js"
import { Message } from "../model/Message.js"
import { MoreThan } from "typeorm"
import {
  MessageHandlerTemplate,
  TokenTransferProposalTemplate,
  TokenTransferConfirmationTemplate,
} from "../templates/telegram.js"
import { ElizaConversationService } from "./el/conversation.js"
import { sendFractionToken } from "../eliza/actions/sendFractionToken.js"
import { Message as TgMessage } from "grammy/types"
import {
  extractTagValue,
  parseTransferRequestsWithRegex,
} from "../utils/extract.js"
import { UserService } from "./user.js"

export class ElizaService {
  public runtime: AgentRuntime
  private telegramBot: Bot<Context>
  private lastProposal: string | null = null
  public conversationService: ElizaConversationService
  private userService: UserService

  constructor(telegramBot: Bot<Context>) {
    this.telegramBot = telegramBot

    // 長期記憶用DB（eliza.sqlite）を使用
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
    this.userService = new UserService()
  }

  /**
   * 通常のメッセージを AgentRuntime の memory に登録する
   * ※ コマンド（先頭が "/"）は対象外とする
   */
  public async processMessage(ctx: Context): Promise<void> {
    const message = ctx.message
    let messageText = ""
    if ("text" in message) {
      messageText = message.text.trim()
    } else if ("caption" in message && message.caption) {
      messageText = message.caption.trim()
    }
    if (messageText.startsWith("/")) return

    const content: Content = { text: messageText, source: "telegram" }
    const messageId = stringToUuid(
      message.message_id.toString() + "-" + this.runtime.agentId
    ) as UUID
    const userId = stringToUuid(ctx.from.id.toString())
    const roomId = stringToUuid(
      ctx.chat.id.toString() + "-" + this.runtime.agentId
    )

    const mem = await this.runtime.messageManager.addEmbeddingToMemory({
      id: messageId,
      agentId: this.runtime.agentId,
      userId,
      roomId,
      content,
      createdAt: message.date * 1000,
    })
    await this.runtime.messageManager.createMemory(mem, true)
  }

  /**
   * Interpret the user's reply for token transfer confirmation using LLM.
   */
  private async interpretConfirmation(
    userReply: string
  ): Promise<{ action: string; tokenId?: string; amount?: number }> {
    const confirmationContext = composeContext({
      template: TokenTransferConfirmationTemplate,
      userReply: userReply,
    } as any)
    const confirmationResult = await generateText({
      runtime: this.runtime,
      context: confirmationContext,
      modelClass: ModelClass.MEDIUM,
    })
    console.log("LLM Confirmation result:", confirmationResult)
    try {
      const resultObj = JSON.parse(confirmationResult)
      return resultObj
    } catch (e) {
      console.error("Error parsing confirmation result:", e)
      return { action: "cancel" }
    }
  }

  public async suggestExchange(ctx: Context) {
    console.log("Processing /suggest command")
    const id = stringToUuid(
      ctx.from.id.toString() + this.runtime.agentId + "suggest"
    )
    const userId = stringToUuid(ctx.from.id.toString())
    const roomId = stringToUuid(
      ctx.chat.id.toString() + "-" + this.runtime.agentId
    )
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    // telegram_message.sqlite に保存されたグループ会話データ取得
    const messageRepo = AppDataSource.getRepository(Message)
    const conversationMessages = await messageRepo.find({
      where: {
        group_id: ctx.chat.id.toString(),
        created_at: MoreThan(new Date(weekAgo)),
      },
    })

    let state = await this.runtime.composeState(
      {
        id,
        agentId: this.runtime.agentId,
        userId,
        roomId,
        content: { text: "Generate Suggestion", source: "telegram" },
        createdAt: new Date().getDate() / 1000,
      },
      {
        pastConvoData: conversationMessages
          .slice(-30)
          .map((cm) => `${cm.user_id}: ${cm.text}`)
          .join("\n"),
      }
    )
    await this.runtime.updateRecentMessageState(state)

    const context = composeContext({
      state,
      template: TokenTransferProposalTemplate,
    })

    const proposalXml = await generateText({
      runtime: this.runtime,
      context,
      modelClass: ModelClass.MEDIUM,
    })
    this.lastProposal = proposalXml

    // XMLから各タグ値を抽出
    try {
      const transferRequestArray: {
        senderUserId: string
        receiverUserId: string
        roleName: string
        amount: string
      }[] = parseTransferRequestsWithRegex(proposalXml)

      for (const transferRequest of transferRequestArray) {
        const sender = await this.userService.findByUserId(
          transferRequest.senderUserId
        )
        const receiver = await this.userService.findByUserId(
          transferRequest.receiverUserId
        )
        if (!sender || !receiver) continue
        await this.telegramBot.api.sendMessage(
          ctx.chat.id,
          `Hey, @${sender.user_name}! How about sending ${transferRequest.amount} ${transferRequest.roleName} to ${receiver.user_name}?`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Yes",
                    callback_data: `yes-${transferRequest.senderUserId}-${transferRequest.receiverUserId}-${transferRequest.roleName}-${transferRequest.amount}`,
                  },
                  {
                    text: "No",
                    callback_data: "no",
                  },
                ],
              ],
            },
          }
        )
      }
    } catch (error) {
      await this.telegramBot.api.sendMessage(
        ctx.chat.id,
        "抽出に失敗しました。"
      )
    }
    return
  }

  public async generateResponse(ctx: Context) {
    console.log("Eliza command received")
    const message = ctx.message
    let messageText = ""
    if ("text" in message) {
      messageText = message.text.trim()
    } else if ("caption" in message && message.caption) {
      messageText = message.caption.trim()
    }
    console.log("Extracted message text:", messageText)

    // ① ユーザーがBotの提案メッセージに返信して送金指示を出す場合
    if (ctx.message.reply_to_message && messageText.includes("送りたい")) {
      const confirmationData = await this.interpretConfirmation(messageText)
      if (confirmationData.action === "transfer") {
        const userTokenId = confirmationData.tokenId
        const userAmount = confirmationData.amount
        // 提案メッセージのXMLから sender と receiver を抽出
        const suggestionText = ctx.message.reply_to_message.text
        const extractedReceiver = extractTagValue(
          suggestionText,
          "receiverUserId"
        )
        // sender は必ず /suggest を発行したユーザーの実際の username で上書き
        const actualSender =
          ctx.from && ctx.from.username
            ? "@" + ctx.from.username
            : ctx.from.id.toString()
        if (actualSender && extractedReceiver && userTokenId && userAmount) {
          console.log(
            `Token transfer initiated: from ${actualSender} to ${extractedReceiver}: ${userTokenId} ${userAmount}`
          )
          const output = {
            senderUserId: actualSender,
            receiverUserId: extractedReceiver,
            tokenId: userTokenId,
            amount: Number(userAmount),
          }
          this.telegramBot.api.sendMessage(ctx.chat.id, JSON.stringify(output))
          this.lastProposal = null
          return
        } else {
          this.telegramBot.api.sendMessage(
            ctx.chat.id,
            "提案内容の抽出に失敗しました。"
          )
          return
        }
      } else {
        this.telegramBot.api.sendMessage(
          ctx.chat.id,
          "送金提案はキャンセルされました。"
        )
        this.lastProposal = null
        return
      }
    }

    // ③ 通常のメッセージの場合の処理：memory 登録および通常応答生成
    await this.processMessage(ctx)
    const content: Content = { text: messageText, source: "telegram" }
    const messageId = stringToUuid(
      message.message_id.toString() + "-" + this.runtime.agentId
    ) as UUID
    const userId = stringToUuid(ctx.from.id.toString())
    const roomId = stringToUuid(
      ctx.chat.id.toString() + "-" + this.runtime.agentId
    )
    const agentId = this.runtime.agentId

    let state = await this.runtime.composeState({
      id: messageId,
      agentId: this.runtime.agentId,
      userId,
      roomId,
      content,
      createdAt: message.date * 1000,
    } as any)
    state = await this.runtime.updateRecentMessageState(state)

    const defaultContext = composeContext({
      state,
      template: MessageHandlerTemplate,
    })

    const response = await generateText({
      runtime: this.runtime,
      context: defaultContext,
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
      body: { message, context: defaultContext, response },
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
    message: TgMessage
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
