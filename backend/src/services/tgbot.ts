import { Bot, webhookCallback } from "grammy"

export class TgBotService {
  private bot: Bot
  private webhookUrl: string

  constructor(webhookUrl: string) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is required")
    }
    this.webhookUrl = `${webhookUrl}/telegram/webhook`
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN)
    console.log(process.env.TELEGRAM_BOT_TOKEN)
  }

  public getWebhookCallback() {
    return webhookCallback(this.bot, "express", {
      timeoutMilliseconds: 10 * 60 * 1000,
      onTimeout: "return",
    })
  }

  async start(): Promise<void> {
    await this.bot.api.setWebhook(this.webhookUrl)
    await this.bot.api.setMyCommands([
      { command: "start", description: "Start the bot" },
    ])
    this.bot.command("start", (ctx) => ctx.reply("Hello, World!"))
    this.bot.on("message", (msg) => {
      console.log(msg.message.text)
    })
  }

  public getBotInfo() {
    return this.bot.api.getMe()
  }

  async stop(): Promise<void> {
    await this.bot.api.deleteWebhook()
  }
}
