import { Bot, webhookCallback, Context } from "grammy"
import "reflect-metadata"
import { Repository } from "typeorm"
import { Message } from "../model/Message.js"
import { AppDataSource } from "../lib/data-source.js"
import { ElizaService } from "./eliza.js"

export class TgBotService {
  private bot: Bot
  private eliza: ElizaService
  private webhookUrl: string
  private messageRepository: Repository<Message>

  constructor(webhookUrl: string) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is required")
    }
    this.webhookUrl = `${webhookUrl}/telegram/webhook`
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN)

    this.messageRepository = AppDataSource.getRepository(Message)
  }

  public async getBot() {
    return this.bot
  }

  // getBotInfo メソッドを追加
  public async getBotInfo() {
    return await this.bot.api.getMe()
  }

  public setEliza(eliza: ElizaService) {
    this.eliza = eliza
  }

  /**
   * webhook 用のコールバックを取得
   */
  public getWebhookCallback() {
    return webhookCallback(this.bot, "express", {
      timeoutMilliseconds: 10 * 60 * 1000,
      onTimeout: "return",
    })
  }

  /**
   * Bot の起動
   */
  public async start(): Promise<void> {
    await this.bot.api.setWebhook(this.webhookUrl)
    console.log("Telegram Bot started with webhook at:", this.webhookUrl)

    // コマンド設定
    await this.bot.api.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "eliza", description: "Start the Eliza chatbot" },
    ])

    // start コマンドのハンドリング
    this.bot.command("start", (ctx) => ctx.reply("Hello, World!"))

    this.bot.command("eliza", async (ctx) => {
      await this.eliza.generateResponse(ctx)
    })

    // イベントハンドラを追加（全チャットタイプ対象のデバッグ用）
    this.bot.on("message", async (ctx) => {
      await this.handleOnMessage(ctx)
    })
  }

  private async handleOnMessage(ctx: Context) {
    // 抽出するテキストを取得
    const text = ctx.message?.text || ""
    console.log("Extracted message text:", text)

    // チャット情報が存在しない場合は処理を終了
    if (!ctx.chat) return

    // 抽出する各項目を取得
    const groupId = ctx.chat.id.toString()
    const userId = ctx.from?.id.toString() || "unknown"
    // Telegram のメッセージ日付は UNIX タイムスタンプ（秒単位）なので、Date オブジェクトに変換
    const createdAt = new Date((ctx.message?.date || Date.now()) * 1000)

    // Message エンティティの作成
    const msg = new Message()
    msg.group_id = groupId
    msg.user_id = userId
    msg.text = text
    msg.created_at = createdAt

    // DB 保存処理
    try {
      await this.messageRepository.save(msg)
      console.log(`Saved message from user ${userId} in chat ${groupId}`)
    } catch (error) {
      console.error("Error saving message:", error)
    }
  }

  /**
   * Bot の停止処理
   */
  public async stop(): Promise<void> {
    await this.bot.api.deleteWebhook()
  }
}
