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
} from "sequelize-typescript";
import mainWindow from "@main/window";
import log from "@main/logger";

const logger = log.scope("db/models/note");
@Table({
  modelName: "ChatMessage",
  tableName: "chat_messages",
  underscored: true,
  timestamps: true,
})
export class ChatMessage extends Model<ChatMessage> {
  @IsUUID("all")
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true, type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  memberId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  sessionId: string;

  @Column(DataType.TEXT)
  content: string;

  @Column(DataType.STRING)
  state: string;
}
