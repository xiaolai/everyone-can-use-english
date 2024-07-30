import {
  AfterUpdate,
  AfterDestroy,
  Table,
  Column,
  Default,
  IsUUID,
  Model,
  DataType,
  AfterCreate,
  AllowNull,
  HasMany,
} from "sequelize-typescript";
import log from "@main/logger";
import { ChatMember, ChatSession } from "@main/db/models";
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

  @Column(DataType.JSON)
  config: any;

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

  @Column(DataType.VIRTUAL)
  get membersCount(): number {
    return this.members.length;
  }

  @Column(DataType.VIRTUAL)
  get sttEngine(): string {
    return this.config?.sttEngine;
  }

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

  static async notify(chat: Chat, action: "create" | "update" | "destroy") {
    if (!mainWindow.win) return;

    // query chat members and include agent
    const members = await ChatMember.findAll({
      where: { chatId: chat.id },
      include: ["agent"],
    });

    const record = chat.toJSON();
    record.members = members.map((member) => member.toJSON());

    mainWindow.win.webContents.send("db-on-transaction", {
      model: "Chat",
      id: chat.id,
      action: action,
      record,
    });
  }
}
