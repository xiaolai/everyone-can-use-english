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
} from "sequelize-typescript";
import log from "@main/logger";
import { ChatAgent, ChatMember, ChatSession } from "@main/db/models";
import mainWindow from "@main/window";

const logger = log.scope("db/models/note");
@Table({
  modelName: "Chat",
  tableName: "chats",
  underscored: true,
  timestamps: true,
})
export class Chat extends Model<Chat> {
  @IsUUID("all")
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true, type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.TEXT)
  topic: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  language: string;

  @Column(DataType.TEXT)
  digest: string;

  @HasMany(() => ChatSession, {
    foreignKey: "chatId",
    constraints: false,
    onDelete: "CASCADE",
    hooks: true,
  })
  sessions: ChatSession[];

  @HasMany(() => ChatMember, {
    foreignKey: "chatId",
    constraints: false,
    onDelete: "CASCADE",
    hooks: true,
  })
  members: ChatMember[];

  @AfterCreate
  static async notifyForCreate(chat: Chat) {
    Chat.notify(chat, "create");
  }

  @AfterUpdate
  static async notifyForUpdate(chat: Chat) {
    Chat.notify(chat, "update");
  }

  @AfterDestroy
  static async notifyForDestroy(chat: Chat) {
    Chat.notify(chat, "destroy");
  }

  static notify(chat: Chat, action: "create" | "update" | "destroy") {
    if (!mainWindow.win) return;

    mainWindow.win.webContents.send("db-on-transaction", {
      model: "Chat",
      id: chat.id,
      action: action,
      record: chat.toJSON(),
    });
  }
}
