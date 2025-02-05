import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { TgBotService } from "./services/tgbot";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// TgBotService のインスタンスを 1 つだけ作成する
const tgService = new TgBotService(process.env.NGROK_URL!);

// Webhook ルートを最優先で定義（POST リクエストのみ対象）
// ※ このルートは生の JSON データを受け取るため、express.raw() ミドルウェアを使用します。
// ※ 他のボディパーサー（express.json() 等）の前に定義してください。
app.post(
  "/telegram/webhook",
  express.raw({ type: "application/json" }),
  tgService.getWebhookCallback()
);

// その後に他のボディパーサーやミドルウェアを定義
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// テスト用ルート
app.get("/hello", (_req, res) => {
  res.send("Hello, World");
});

// キャッチオールルート：定義されていないルートに対して 404 を返す
app.use((_req, res) => {
  res.status(404).send("Not Found");
});

// サーバーを 0.0.0.0 でリッスン（外部からの接続も受け付ける）
app.listen(3001, "0.0.0.0", async () => {
  try {
    await tgService.start();
    console.log("Server listening on port 3001");
  } catch (error) {
    console.error("Error starting server or TgBotService:", error);
  }
});
