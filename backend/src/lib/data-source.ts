import "reflect-metadata"
import { DataSource } from "typeorm"
import { Message } from "../model/Message"

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "telegram_message.sqlite",
  entities: [Message],
  synchronize: true, // 本番環境では false 推奨
  logging: false,
})
