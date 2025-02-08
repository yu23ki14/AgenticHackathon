import { Router } from "express"
import { getMessages } from "../controller/message.js"

const messageRouter: Router = Router()

messageRouter.get("/", getMessages)

export default messageRouter
