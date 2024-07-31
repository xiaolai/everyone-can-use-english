import { ipcMain, IpcMainEvent } from "electron";
import { ChatSession } from "@main/db/models";
import { FindOptions, Attributes } from "sequelize";
import log from "@main/logger";

const logger = log.scope("db/handlers/chats-handler");

class ChatSessionsHandler {
  private async findAll(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<ChatSession>> & { query?: string }
  ) {}

  private async create(
    _event: IpcMainEvent,
    params: {
      chatId: string;
      content: string;
      url: string;
    }
  ) {
    logger.debug("create chat session");
  }

  private async reply() {}

  register() {
    ipcMain.handle("chat-sessions-find-all", this.findAll);
    ipcMain.handle("chat-sessions-create", this.create);
    ipcMain.handle("chat-sessions-reply", this.reply);
  }
}

export const chatSessionsHandler = new ChatSessionsHandler();
