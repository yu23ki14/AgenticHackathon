import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { TgBotService } from "./services/tgbot"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(cors())

app.use(express.json())
app.use(cookieParser())

const tgService = new TgBotService(process.env.NGROK_URL!)

app.use("/hello", (_req, res) => {
  res.send("Hello, World")
})

app.use("/telegram/webhook", tgService.getWebhookCallback())

app.use((_req, res) => {
  res.status(404).send("Not Found")
})

app.listen(3001, async () => {
  await tgService.start()
  const botInfo = await tgService.getBotInfo()
  console.log("Bot info:", botInfo)
  console.log("Server listening on port 3001")
})
