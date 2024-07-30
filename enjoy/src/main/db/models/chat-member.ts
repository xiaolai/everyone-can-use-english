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
import { Chat, ChatAgent } from "@main/db/models";

const logger = log.scope("db/models/note");
@Table({
  modelName: "ChatMember",
  tableName: "chat_members",
  underscored: true,
  timestamps: true,
})
export class ChatMember extends Model<ChatMember> {
  @IsUUID("all")
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true, type: DataType.UUID })
  id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  chatId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  userId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  userType: string;

  @Column(DataType.STRING)
  state: string;

  @BelongsTo(() => Chat, {
    foreignKey: "chatId",
  })
  chat: Chat;

  @BelongsTo(() => ChatAgent, {
    foreignKey: "userId",
  })
  agent: ChatAgent;

  @Column(DataType.VIRTUAL)
  get user(): {
    name: string;
    avatarUrl: string;
  } {
    if (this.userType === "User") {
      const user = settings.getSync("user") as {
        name: string;
        avatarUrl: string;
      };

      if (!user.avatarUrl) {
        user.avatarUrl = `https://api.dicebear.com/9.x/croodles/svg?seed=${user.name}`;
      }

      return user;
    }
  }
}
