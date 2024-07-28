import { ipcMain, IpcMainEvent } from "electron";
import { ChatSession } from "@main/db/models";
import { FindOptions, WhereOptions, Attributes, Op } from "sequelize";
import downloader from "@main/downloader";
import log from "@main/logger";
import { t } from "i18next";
import youtubedr from "@main/youtubedr";
import { pathToEnjoyUrl } from "@/main/utils";

const logger = log.scope("db/handlers/chats-handler");

class ChatSessionsHandler {
  private async findAll(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<ChatSession>> & { query?: string }
  ) {}

  register() {
    ipcMain.handle("chat-sessions-find-all", this.findAll);
  }
}

export const chatSessionsHandler = new ChatSessionsHandler();
