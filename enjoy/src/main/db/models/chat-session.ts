import {
  AfterUpdate,
  AfterDestroy,
  BelongsTo,
  Table,
  Column,
  Default,
  IsUUID,
  Model,
  DataType,
  AfterCreate,
  AllowNull,
  AfterFind,
  HasMany,
  Scopes,
} from "sequelize-typescript";
import mainWindow from "@main/window";
import log from "@main/logger";
import { Chat, ChatMember, ChatMessage } from "@main/db/models";

const logger = log.scope("db/models/chat-session");
@Table({
  modelName: "ChatSession",
  tableName: "chat_sessions",
  underscored: true,
  timestamps: true,
})
@Scopes(() => ({
  defaultScope: {
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
        ],
      },
    ],
  },
}))
export class ChatSession extends Model<ChatSession> {
  @IsUUID("all")
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true, type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  chatId: string;

  @Column(DataType.STRING)
  state: string;

  @BelongsTo(() => Chat, {
    foreignKey: "chatId",
    constraints: false,
  })
  chat: Chat;

  @HasMany(() => ChatMessage, {
    foreignKey: "sessionId",
    constraints: false,
    as: "messages",
  })
  messages: ChatMessage[];

  @AfterCreate
  static async notifyForCreate(chatSession: ChatSession) {
    ChatSession.notify(chatSession, "create");
  }

  @AfterUpdate
  static async notifyForUpdate(chatSession: ChatSession) {
    ChatSession.notify(chatSession, "update");
  }

  @AfterDestroy
  static async notifyForDestroy(chatSession: ChatSession) {
    ChatSession.notify(chatSession, "destroy");
  }

  static async notify(
    chatSession: ChatSession,
    action: "create" | "update" | "destroy"
  ) {
    if (!mainWindow.win) return;

    mainWindow.win.webContents.send("db-on-transaction", {
      model: "ChatSession",
      id: chatSession.id,
      action: action,
      record: chatSession.toJSON(),
    });
  }
}
