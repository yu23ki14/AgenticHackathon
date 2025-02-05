// src/scripts/showMessages.ts
import "reflect-metadata";
import { createConnection } from "typeorm";
// Message エンティティのパスをプロジェクト構成に合わせて変更してください
import { Message } from "../services/tgbot"; // 例: tgbot.ts 内に Message エンティティが定義されている場合

async function showMessages() {
  const connection = await createConnection({
    type: "sqlite",
    database: "telegram_messages.db",
    entities: [Message],
    synchronize: false, // DB 既存の場合は false にしておく
    logging: false,
  });

  const messages = await connection.getRepository(Message).find();
  console.log("Stored messages:", messages);

  await connection.close();
}

showMessages().catch(console.error);
