import { ipcMain, IpcMainEvent } from "electron";
import { ChatMessage, ChatSession } from "@main/db/models";
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
      chatMessage: Partial<ChatMessageType>;
    }
  ) {
    const { chatId, chatMessage } = params;
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
    await ChatMessage.create(
      { ...chatMessage, sessionId: session.id },
      { transaction }
    );

    await transaction.commit();

    await session.reload({
      include: [
        {
          association: ChatSession.associations.messages,
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
