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
  modelName: "ChatAgent",
  tableName: "chat_agents",
  underscored: true,
  timestamps: true,
})
export class ChatAgent extends Model<ChatAgent> {
  @IsUUID("all")
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true, type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  introduction: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  language: string;

  @Column(DataType.JSON)
  config: any;
}
