import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { AppDataSource } from "./lib/data-source.js"
import messageRouter from "./router/message.js"
import { ElizaService } from "./services/eliza.js"
import { TgBotService } from "./services/tgbot.js"
import { sendETH } from "./lib/collabland.js"

dotenv.config()

const services: any[] = []
const app = express()

// その後に他のボディパーサーやミドルウェアを定義
app.use(express.json())
app.use(cookieParser())
app.use(cors())

AppDataSource.initialize().then(async () => {
  const tgService = new TgBotService(process.env.NGROK_URL!)
  const elizaService = new ElizaService(await tgService.getBot())
  tgService.setEliza(elizaService)

  app.get("/hello", async (_req, res) => {
    res.send("Hello, World")
  })

  app.use("/telegram/webhook", tgService.getWebhookCallback())
  app.use("/messages", messageRouter)

  // キャッチオールルート：定義されていないルートに対して 404 を返す
  app.use((_req, res) => {
    res.status(404).send("Not Found")
  })

  // サーバーを 0.0.0.0 でリッスン（外部からの接続も受け付ける）
  app.listen(3001, "0.0.0.0", async () => {
    try {
      await tgService.start()

      services.push(tgService)
      services.push(elizaService)
      console.log("Server listening on port 3001")
    } catch (error) {
      console.error("Error starting server or TgBotService:", error)
    }
  })
})

async function gracefulShutdown() {
  console.log("Shutting down gracefully... ")
  await Promise.all(services.map((service) => service.stop()))
  process.exit(0)
}

// Register shutdown handlers
process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)
