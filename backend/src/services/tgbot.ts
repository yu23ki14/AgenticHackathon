import { Bot, webhookCallback, Context } from "grammy";
import "reflect-metadata";
import {
  createConnection,
  Connection,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Repository,
} from "typeorm";

// -----------------------------
// 1. Message Entity の定義
// -----------------------------
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  // Telegram の group_id を文字列として保存
  @Column()
  group_id!: string;

  // ユーザーID（user_id）
  @Column()
  user_id!: string;

  // メッセージ本文
  @Column({ type: "text" })
  text!: string;

  // メッセージ送信日時
  @Column({ type: "datetime" })
  created_at!: Date;
}

// -----------------------------
// 2. TgBotService クラス
// -----------------------------
export class TgBotService {
  private bot: Bot;
  private webhookUrl: string;
  private dbConnection!: Connection;
  private messageRepository!: Repository<Message>;

  constructor(webhookUrl: string) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is required");
    }
    // webhook の URL を指定（例: https://your-domain.com/telegram/webhook）
    this.webhookUrl = `${webhookUrl}/telegram/webhook`;
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

    // すべての更新をグローバルミドルウェアでログ出力（更新が Buffer なら文字列に変換してから JSON パース）
    this.bot.use(async (ctx, next) => {
      let updateData = ctx.update;
      if (Buffer.isBuffer(ctx.update)) {
        try {
          updateData = JSON.parse(ctx.update.toString());
        } catch (error) {
          console.error("Error parsing update buffer:", error);
        }
      }
      console.log("Global middleware received update:", JSON.stringify(updateData, null, 2));
      await next();
    });
  }

  // getBotInfo メソッドを追加
  public async getBotInfo() {
    return await this.bot.api.getMe();
  }

  /**
   * データベース接続の初期化
   */
  private async initDB() {
    this.dbConnection = await createConnection({
      type: "sqlite", // SQLite を利用（本番環境では PostgreSQL 等も検討）
      database: "telegram_messages.db",
      entities: [Message],
      synchronize: true, // エンティティに合わせてテーブルを自動作成（開発時向け）
      logging: false,
    });
    this.messageRepository = this.dbConnection.getRepository(Message);
    console.log("Database connected and Message repository is ready.");
  }

  /**
   * webhook 用のコールバックを取得
   */
  public getWebhookCallback() {
    return webhookCallback(this.bot, "express", {
      timeoutMilliseconds: 10 * 60 * 1000,
      onTimeout: "return",
    });
  }

  /**
   * Bot の起動
   */
  public async start(): Promise<void> {
    // 1. データベースの初期化
    await this.initDB();

    // 2. Telegram Bot の webhook 設定
    await this.bot.api.setWebhook(this.webhookUrl);
    console.log("Telegram Bot started with webhook at:", this.webhookUrl);

    // イベントハンドラを追加（全チャットタイプ対象のデバッグ用）
    this.bot.on("message", async (ctx: Context) => {
      console.log("Inside message event handler.");
      console.log("Complete ctx.message:", JSON.stringify(ctx.message, null, 2));

      // 抽出するテキストを取得
      const text = ctx.message?.text || "";
      console.log("Extracted message text:", text);

      // チャット情報が存在しない場合は処理を終了
      if (!ctx.chat) return;

      // 抽出する各項目を取得
      const groupId = ctx.chat.id.toString();
      const userId = ctx.from?.id.toString() || "unknown";
      // Telegram のメッセージ日付は UNIX タイムスタンプ（秒単位）なので、Date オブジェクトに変換
      const createdAt = new Date((ctx.message?.date || Date.now()) * 1000);

      // Message エンティティの作成
      const msg = new Message();
      msg.group_id = groupId;
      msg.user_id = userId;
      msg.text = text;
      msg.created_at = createdAt;

      // DB 保存処理
      try {
        await this.messageRepository.save(msg);
        console.log(`Saved message from user ${userId} in chat ${groupId}`);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // コマンド設定
    await this.bot.api.setMyCommands([
      { command: "start", description: "Start the bot" },
    ]);

    // /start コマンドのハンドリング
    this.bot.command("start", (ctx) => ctx.reply("Hello, World!"));

    console.log("Telegram Bot started with webhook at:", this.webhookUrl);
  }

  /**
   * Bot の停止処理
   */
  public async stop(): Promise<void> {
    await this.bot.api.deleteWebhook();
    if (this.dbConnection && this.dbConnection.isConnected) {
      await this.dbConnection.close();
      console.log("Database connection closed.");
    }
  }
}
