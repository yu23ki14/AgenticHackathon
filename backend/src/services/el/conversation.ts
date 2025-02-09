import { Context } from "grammy"
import { ElizaService } from "../eliza"

export class ElizaConversationService {
  private eliza: ElizaService

  constructor(eliza: ElizaService) {
    this.eliza = eliza
  }

  public async handleTelegramMessage(ctx: Context) {}
}
