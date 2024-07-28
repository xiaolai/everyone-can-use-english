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
import settings from "@main/settings";

const logger = log.scope("db/models/note");
@Table({
  modelName: "ChatSession",
  tableName: "chat_sessions",
  underscored: true,
  timestamps: true,
})
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
}
