import { ipcMain, IpcMainEvent } from "electron";
import { ChatMessage } from "@main/db/models";
import { FindOptions, WhereOptions, Attributes, Op } from "sequelize";
import downloader from "@main/downloader";
import log from "@main/logger";
import { t } from "i18next";
import youtubedr from "@main/youtubedr";
import { pathToEnjoyUrl } from "@/main/utils";

const logger = log.scope("db/handlers/chats-handler");

class ChatMessagesHandler {
  private async findAll(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<ChatMessage>> & { query?: string }
  ) {
  }

  register() {
    ipcMain.handle("chat-messages-find-all", this.findAll);
  }
}

export const chatMessagesHandler = new ChatMessagesHandler();