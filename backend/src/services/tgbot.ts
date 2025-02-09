import { Bot, webhookCallback, Context } from "grammy"
import "reflect-metadata"
import { Repository } from "typeorm"
import { Message } from "../model/Message.js"
import { AppDataSource } from "../lib/data-source.js"
import { ElizaService } from "./eliza.js"
import { UserService } from "./user.js"
import { sendFractionToken } from "../eliza/actions/sendFractionToken.js"
import { sendAssistCredit } from "../lib/collabland.js"
import { Address } from "viem"

export class TgBotService {
  private bot: Bot
  private eliza: ElizaService
  private userService: UserService
  private webhookUrl: string
  private messageRepository: Repository<Message>

  constructor(webhookUrl: string) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is required")
    }
    this.webhookUrl = `${webhookUrl}/telegram/webhook`
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN)

    this.messageRepository = AppDataSource.getRepository(Message)
    this.userService = new UserService()
  }

  public async getBot() {
    return this.bot
  }

  public async getBotInfo() {
    return await this.bot.api.getMe()
  }

  public setEliza(eliza: ElizaService) {
    this.eliza = eliza
  }

  public getWebhookCallback() {
    return webhookCallback(this.bot, "express", {
      timeoutMilliseconds: 10 * 60 * 1000,
      onTimeout: "return",
    })
  }

  public async start(): Promise<void> {
    await this.bot.api.setWebhook(this.webhookUrl)
    console.log("Telegram Bot started with webhook at:", this.webhookUrl)

    // コマンド設定：/start, /eliza, /suggest, /setwallet
    await this.bot.api.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "eliza", description: "Start the Eliza chatbot" },
      { command: "suggest", description: "Generate token transfer proposals" },
      { command: "setwallet", description: "Set your wallet address" },
    ])

    this.bot.command("start", async (ctx) => {
      const user = await this.userService.findByUserId(ctx.from.id.toString())
      if (user) {
        ctx.reply(
          "Welcome back! Your wallet address is set to " + user.wallet_address
        )
      } else {
        ctx.reply(
          "Welcome! Please set your wallet address using the /setwallet command."
        )
      }
    })

    this.bot.command("eliza", async (ctx) => {
      await this.eliza.generateResponse(ctx)
    })

    this.bot.command("suggest", async (ctx) => {
      await this.eliza.suggestExchange(ctx)
    })

    this.bot.command("setwallet", async (ctx) => {
      const address = ctx.match
      if (!address || address.length !== 42 || !address.startsWith("0x")) {
        ctx.reply("Invalid wallet address. Please try again.")
      } else {
        await this.userService.create(
          ctx.from.id.toString(),
          ctx.from.username,
          address
        )
        ctx.reply("Wallet address set successfully.")
      }
    })

    this.bot.on("callback_query:data", async (ctx) => {
      const [answer, senderUserId, receiverUserId, role, amount] =
        ctx.callbackQuery.data.split("-")
      try {
        if (ctx.from.id.toString() === senderUserId && answer === "yes") {
          await ctx.answerCallbackQuery({ text: `I'll manage it! ` })
          await this.handleSendAssistCredit(
            senderUserId,
            receiverUserId,
            role,
            amount,
            ctx
          )
        }
      } catch (error) {}
    })

    // 全メッセージイベント：DB保存と Eliza の memory 登録
    this.bot.on("message", async (ctx) => {
      await this.handleOnMessage(ctx)
    })
  }

  private async handleOnMessage(ctx: Context) {
    console.log("Received message:", ctx.message)
    const text = ctx.message.text || ""
    console.log("Extracted message text:", text)
    if (!ctx.chat) return
    const groupId = ctx.chat.id.toString()
    const userId = ctx.from.id.toString()
    const createdAt = new Date((ctx.message?.date || Date.now()) * 1000)

    const msg = new Message()
    msg.group_id = groupId
    msg.user_id = userId
    msg.text = text
    msg.created_at = createdAt

    try {
      await this.messageRepository.save(msg)
      console.log(`Saved message from user ${userId} in chat ${groupId}`)
    } catch (error) {
      console.error("Error saving message:", error)
    }

    // if (this.eliza) {
    //   await this.eliza.processMessage(ctx)
    // }
  }

  private async handleSendAssistCredit(
    senderUserId: string,
    receiverUserId: string,
    role: string,
    amount: string,
    ctx: Context
  ) {
    const sender = await this.userService.findByUserId(senderUserId)
    const receiver = await this.userService.findByUserId(receiverUserId)

    if (!sender || !receiver) {
      return
    }
    const tokenId = BigInt(
      "112131423684283729664251661502031928930668201445594322354989370790549897908305"
    )

    try {
      await sendAssistCredit(
        sender.wallet_address as Address,
        receiver.wallet_address as Address,
        tokenId,
        BigInt(amount)
      )

      await ctx.api.sendMessage(
        sender.user_id,
        `Successfully sent ${amount} Assist Credit to ${receiver.user_name}`
      )
    } catch (error) {
      console.error(error)
    }
  }

  public async stop(): Promise<void> {
    await this.bot.api.deleteWebhook()
  }
}
