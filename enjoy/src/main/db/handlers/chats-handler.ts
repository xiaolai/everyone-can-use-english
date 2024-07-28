import { ipcMain, IpcMainEvent } from "electron";
import { Chat } from "@main/db/models";
import { FindOptions, WhereOptions, Attributes, Op } from "sequelize";
import downloader from "@main/downloader";
import log from "@main/logger";
import { t } from "i18next";
import youtubedr from "@main/youtubedr";
import { pathToEnjoyUrl } from "@/main/utils";

const logger = log.scope("db/handlers/chats-handler");

class ChatsHandler {
  private async findAll(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<Chat>> & { query?: string }
  ) {
    const { query, where = {} } = options || {};
    delete options.query;
    delete options.where;

    if (query) {
      (where as any).name = {
        [Op.like]: `%${query}%`,
      };
    }
    const chats = await Chat.findAll({
      order: [["updatedAt", "DESC"]],
      include: [{}],
      where,
      ...options,
    });

    if (!chats) {
      return [];
    }
    return chats.map((chat) => chat.toJSON());
  }

  register() {
    ipcMain.handle("chats-find-all", this.findAll);
  }
}

export const chatsHandler = new ChatsHandler();