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
import mainWindow from "@main/window";
import log from "@main/logger";
import settings from "@main/settings";
import { ChatAgent, ChatMember, ChatSession } from "@main/db/models";

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
}
