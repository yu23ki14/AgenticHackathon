import { Request, Response } from "express"
import { AppDataSource } from "../lib/data-source"
import { Message } from "../model/Message"

export const getMessages = async (req: Request, res: Response) => {
  const messages = await AppDataSource.getRepository(Message).find()

  console.log("messages: ", messages)

  res.json(messages)
}
