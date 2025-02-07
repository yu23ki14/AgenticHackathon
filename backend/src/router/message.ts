import { Router } from "express"
import { getMessages } from "../controller/message"

const messageRouter = Router()

messageRouter.get("/", getMessages)

export default messageRouter
