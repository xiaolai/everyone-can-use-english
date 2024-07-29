import { ipcMain, IpcMainEvent } from "electron";
import { Chat, ChatMember, ChatSession } from "@main/db/models";
import { FindOptions, WhereOptions, Attributes, Op } from "sequelize";
import log from "@main/logger";
import { t } from "i18next";
import db from "@main/db";

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
      include: [
        {
          association: "members",
          model: ChatMember,
        },
        {
          association: "sessions",
          model: ChatSession,
        },
      ],
      where,
      ...options,
      group: ["Chat.id"],
    });

    if (!chats) {
      return [];
    }
    return chats.map((chat) => chat.toJSON());
  }

  private async findOne(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<Chat>> & {
      where: WhereOptions<Attributes<Chat>>;
    }
  ) {
    const chat = await Chat.findOne(options);
    if (!chat) {
      return null;
    }
    return chat.toJSON();
  }

  private async create(
    _event: IpcMainEvent,
    data: {
      name: string;
      language: string;
      topic: string;
      members: Array<{
        userId: string;
        userType: string;
      }>;
    }
  ) {
    const { members, ...chatData } = data;
    if (!members || members.length === 0) {
      throw new Error(t("models.chats.membersRequired"));
    }

    const transaction = await db.connection.transaction();
    const chat = await Chat.create(chatData, {
      transaction,
    });
    for (const member of members) {
      await ChatMember.create(
        {
          chatId: chat.id,
          userId: member.userId,
          userType: member.userType,
        },
        {
          include: [Chat],
          transaction,
        }
      );
    }
    await transaction.commit();

    return chat.toJSON();
  }

  private async update(
    _event: IpcMainEvent,
    id: string,
    data: {
      name: string;
      language: string;
      topic: string;
      members: Array<{
        userId: string;
        userType: string;
      }>;
    }
  ) {
    const { members, ...chatData } = data;
    if (!members || members.length === 0) {
      throw new Error(t("models.chats.membersRequired"));
    }
    const chat = await Chat.findOne({
      where: { id },
    });
    if (!chat) {
      throw new Error(t("models.chats.notFound"));
    }

    const transaction = await db.connection.transaction();
    await chat.update(chatData, { transaction });

    const chatMembers = await ChatMember.findAll({
      where: { chatId: chat.id },
    });

    // Remove members
    for (const member of chatMembers) {
      if (!members.find((m) => m.userId === member.userId)) {
        await member.destroy({ transaction });
      }
    }

    // Add or update members
    for (const member of members) {
      const chatMember = chatMembers.find((m) => m.userId === member.userId);
      if (chatMember) {
        await chatMember.update(member, { transaction });
      } else {
        await ChatMember.create(
          {
            chatId: chat.id,
            userId: member.userId,
            userType: member.userType,
          },
          {
            include: [Chat],
            transaction,
          }
        );
      }
    }

    await transaction.commit();

    return chat.toJSON();
  }

  private async destroy(_event: IpcMainEvent, id: string) {
    const chat = await Chat.findOne({
      where: { id },
    });
    if (!chat) {
      throw new Error(t("models.chats.notFound"));
    }

    await chat.destroy();

    return chat.toJSON();
  }

  register() {
    ipcMain.handle("chats-find-all", this.findAll);
    ipcMain.handle("chats-find-one", this.findOne);
    ipcMain.handle("chats-create", this.create);
    ipcMain.handle("chats-update", this.update);
    ipcMain.handle("chats-destroy", this.destroy);
  }
}

export const chatsHandler = new ChatsHandler();
