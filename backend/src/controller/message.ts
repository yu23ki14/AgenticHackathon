import { Request, Response } from "express"
import { AppDataSource } from "../lib/data-source.js"
import { Message } from "../model/Message.js"

export const getMessages = async (req: Request, res: Response) => {
  const messages = await AppDataSource.getRepository(Message).find()

  console.log("messages: ", messages)

  res.json(messages)
}
