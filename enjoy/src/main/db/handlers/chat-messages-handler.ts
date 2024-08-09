import { ipcMain, IpcMainEvent } from "electron";
import { ChatMessage, Recording } from "@main/db/models";
import { FindOptions, WhereOptions, Attributes, Op } from "sequelize";
import log from "@main/logger";
import { enjoyUrlToPath, pathToEnjoyUrl } from "@/main/utils";
import fs from "fs-extra";

const logger = log.scope("db/handlers/chats-handler");

class ChatMessagesHandler {
  private async findAll(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<ChatMessage>> & { query?: string }
  ) {
    const { query, where = {} } = options || {};
    delete options.query;
    delete options.where;

    if (query) {
      (where as any).content = {
        [Op.like]: `%${query}%`,
      };
    }
    const chatMessages = await ChatMessage.findAll({
      order: [["createdAt", "DESC"]],
      where,
      ...options,
    });

    if (!chatMessages) {
      return [];
    }
    return chatMessages.map((chatMessage) => chatMessage.toJSON());
  }

  private async create(
    _event: IpcMainEvent,
    data: Partial<Attributes<ChatMessage>>
  ) {
    const message = await ChatMessage.create(data);

    return message.toJSON();
  }

  private async update(
    _event: IpcMainEvent,
    id: string,
    data: { content: string; url?: string }
  ) {
    const { content, url } = data;
    if (!content || !url) return;

    const message = await ChatMessage.findByPk(id);
    if (!message) return;

    const transaction = await ChatMessage.sequelize.transaction();

    // update content
    await message.update({ content }, { transaction });

    // destroy existing recording
    await message.recording?.destroy({ transaction });

    // create new recording
    const filePath = enjoyUrlToPath(url);
    const blob = fs.readFileSync(filePath);
    await Recording.createFromBlob(
      {
        type: "audio/wav",
        arrayBuffer: blob,
      },
      {
        targetType: "ChatMessage",
        targetId: message.id,
      },
      transaction
    );

    await transaction.commit();
  }

  private async destroy(_event: IpcMainEvent, id: string) {
    const message = await ChatMessage.findByPk(id);
    if (!message) return;

    await message.destroy();
  }

  register() {
    ipcMain.handle("chat-messages-find-all", this.findAll);
    ipcMain.handle("chat-messages-create", this.create);
    ipcMain.handle("chat-messages-update", this.update);
    ipcMain.handle("chat-messages-destroy", this.destroy);
  }
}

export const chatMessagesHandler = new ChatMessagesHandler();
