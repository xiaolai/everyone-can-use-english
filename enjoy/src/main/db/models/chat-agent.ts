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
  BeforeDestroy,
  HasMany,
} from "sequelize-typescript";
import mainWindow from "@main/window";
import log from "@main/logger";
import { ChatMember } from "@main/db/models";

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

  @HasMany(() => ChatMember, {
    foreignKey: "userId",
    constraints: false,
    onDelete: "CASCADE",
    hooks: true,
  })
  members: ChatMember[];

  @Column(DataType.VIRTUAL)
  get avatarUrl(): string {
    return `https://api.dicebear.com/9.x/croodles/svg?seed=${this.getDataValue(
      "name"
    )}`;
  }

  @Column(DataType.VIRTUAL)
  get engine(): string {
    return this.getDataValue("config")?.engine;
  }

  @Column(DataType.VIRTUAL)
  get model(): string {
    return this.getDataValue("config")?.model;
  }

  @Column(DataType.VIRTUAL)
  get prompt(): string {
    return this.getDataValue("config")?.prompt;
  }

  @Column(DataType.VIRTUAL)
  get temperature(): number {
    return this.getDataValue("config")?.temperature;
  }

  @Column(DataType.VIRTUAL)
  get ttsEngine(): string {
    return this.getDataValue("config")?.ttsEngine;
  }

  @Column(DataType.VIRTUAL)
  get ttsModel(): string {
    return this.getDataValue("config")?.ttsModel;
  }

  @Column(DataType.VIRTUAL)
  get ttsVoice(): string {
    return this.getDataValue("config")?.ttsVoice;
  }

  @AfterCreate
  static notifyForCreate(chatAgent: ChatAgent) {
    this.notify(chatAgent, "create");
  }

  @AfterUpdate
  static notifyForUpdate(chatAgent: ChatAgent) {
    this.notify(chatAgent, "update");
  }

  @BeforeDestroy
  static destroyAllMessages(chatAgent: ChatAgent) {}

  @AfterDestroy
  static notifyForDestroy(chatAgent: ChatAgent) {
    this.notify(chatAgent, "destroy");
  }

  static notify(chatAgent: ChatAgent, action: "create" | "update" | "destroy") {
    if (!mainWindow.win) return;

    mainWindow.win.webContents.send("db-on-transaction", {
      model: "ChatAgent",
      id: chatAgent.id,
      action: action,
      record: chatAgent.toJSON(),
    });
  }
}
