import { Bot, webhookCallback, Context } from "grammy";
import "reflect-metadata";
import { Repository } from "typeorm";
import { Message } from "../model/Message.js";
import { AppDataSource } from "../lib/data-source.js";
import { ElizaService } from "./eliza.js";
import { UserService } from "./user.js";

export class TgBotService {
  private bot: Bot;
  private eliza: ElizaService;
  private userService: UserService;
  private webhookUrl: string;
  private messageRepository: Repository<Message>;

  constructor(webhookUrl: string) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is required");
    }
    this.webhookUrl = `${webhookUrl}/telegram/webhook`;
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

    this.messageRepository = AppDataSource.getRepository(Message);
    this.userService = new UserService();
  }

  public async getBot() {
    return this.bot;
  }

  public async getBotInfo() {
    return await this.bot.api.getMe();
  }

  public setEliza(eliza: ElizaService) {
    this.eliza = eliza;
  }

  public getWebhookCallback() {
    return webhookCallback(this.bot, "express", {
      timeoutMilliseconds: 10 * 60 * 1000,
      onTimeout: "return",
    });
  }

  public async start(): Promise<void> {
    await this.bot.api.setWebhook(this.webhookUrl);
    console.log("Telegram Bot started with webhook at:", this.webhookUrl);

    // コマンド設定：/start, /eliza, /suggest, /setwallet
    await this.bot.api.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "eliza", description: "Start the Eliza chatbot" },
      { command: "suggest", description: "Generate token transfer proposals" },
      { command: "setwallet", description: "Set your wallet address" },
    ]);

    this.bot.command("start", async (ctx) => {
      const user = await this.userService.findByUserId(ctx.from.id.toString());
      if (user) {
        ctx.reply("Welcome back! Your wallet address is set to " + user.wallet_address);
      } else {
        ctx.reply("Welcome! Please set your wallet address using the /setwallet command.");
      }
    });

    this.bot.command("eliza", async (ctx) => {
      await this.eliza.generateResponse(ctx);
    });

    this.bot.command("suggest", async (ctx) => {
      await this.eliza.generateResponse(ctx);
    });

    this.bot.command("setwallet", async (ctx) => {
      const address = ctx.match;
      if (!address || address.length !== 42 || !address.startsWith("0x")) {
        ctx.reply("Invalid wallet address. Please try again.");
      } else {
        await this.userService.create(ctx.from.id.toString(), address);
        ctx.reply("Wallet address set successfully.");
      }
    });

    // 全メッセージイベント：DB保存と Eliza の memory 登録
    this.bot.on("message", async (ctx) => {
      await this.handleOnMessage(ctx);
    });
  }

  private async handleOnMessage(ctx: Context) {
    const text = ctx.message?.text || "";
    console.log("Extracted message text:", text);
    if (!ctx.chat) return;
    const groupId = ctx.chat.id.toString();
    const userId = (ctx.from && ctx.from.username ? "@" + ctx.from.username : ctx.from?.id.toString()) || "unknown";
    const createdAt = new Date((ctx.message?.date || Date.now()) * 1000);

    const msg = new Message();
    msg.group_id = groupId;
    msg.user_id = userId;
    msg.text = text;
    msg.created_at = createdAt;

    try {
      await this.messageRepository.save(msg);
      console.log(`Saved message from user ${userId} in chat ${groupId}`);
    } catch (error) {
      console.error("Error saving message:", error);
    }

    if (this.eliza) {
      await this.eliza.processMessage(ctx);
    }
  }

  public async stop(): Promise<void> {
    await this.bot.api.deleteWebhook();
  }
}
