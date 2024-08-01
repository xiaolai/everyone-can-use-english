import { ipcMain, IpcMainEvent } from "electron";
import {
  ChatMember,
  ChatMessage,
  ChatSession,
  Recording,
} from "@main/db/models";
import { FindOptions, Attributes, Op } from "sequelize";
import log from "@main/logger";
import { enjoyUrlToPath } from "@/main/utils";
import fs from "fs-extra";

const logger = log.scope("db/handlers/chats-handler");

class ChatSessionsHandler {
  private async findAll(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<ChatSession>> & { query?: string }
  ) {
    const { query, where = {} } = options || {};
    delete options.query;
    delete options.where;
    if (query) {
      (where as any).name = {
        [Op.like]: `%${query}%`,
      };
    }
    const chatSessions = await ChatSession.findAll({
      order: [["updatedAt", "DESC"]],
      where,
      ...options,
    });

    if (!chatSessions) {
      return [];
    }
    return chatSessions.map((chatSession) => chatSession.toJSON());
  }

  private async create(
    _event: IpcMainEvent,
    params: {
      chatId: string;
      chatMessage: Partial<ChatMessageType>;
      url: string;
    }
  ) {
    const {
      chatId,
      chatMessage: { content, memberId },
      url,
    } = params;
    const transaction = await ChatSession.sequelize.transaction();

    // step 1: ensure all sessions in the chat are 'completed';
    const sessions = await ChatSession.findAll({
      where: { chatId, state: "pending" },
    });
    if (sessions.length > 0) {
      await Promise.all(
        sessions.map((session) => {
          session.state = "completed";
          return session.save({ transaction });
        })
      );
    }

    // step 2: create a new session with the given chatId and chatMessage;
    const session = await ChatSession.create(
      { chatId, state: "pending" },
      { transaction }
    );

    // step 3: create a new chat message with the given chatMessage;
    const message = await ChatMessage.create(
      { memberId, content, sessionId: session.id },
      { transaction }
    );

    // step 4: create recording
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

    await session.reload({
      include: [
        {
          association: ChatSession.associations.messages,
          include: [
            {
              association: ChatMessage.associations.member,
              include: [
                {
                  association: ChatMember.associations.agent,
                },
              ],
            },
            {
              association: ChatMessage.associations.recording,
            },
          ],
        },
      ],
    });

    return session.toJSON();
  }

  private async reply() {}

  register() {
    ipcMain.handle("chat-sessions-find-all", this.findAll);
    ipcMain.handle("chat-sessions-create", this.create);
    ipcMain.handle("chat-sessions-reply", this.reply);
  }
}

export const chatSessionsHandler = new ChatSessionsHandler();
