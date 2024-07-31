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
import settings from "@main/settings";
import { ChatMember, ChatMessage } from "@main/db/models";

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

  @HasMany(() => ChatMessage, {
    foreignKey: "sessionId",
    constraints: false,
    as: "messages",
  })
  messages: ChatMessage[];
}
