import { ipcMain, IpcMainEvent } from "electron";
import { ChatAgent } from "@main/db/models";
import { FindOptions, WhereOptions, Attributes, Op } from "sequelize";
import log from "@main/logger";
import { t } from "i18next";
import { pathToEnjoyUrl } from "@/main/utils";

const logger = log.scope("db/handlers/chat-agents-handler");

class ChatAgentsHandler {
  private async findAll(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<ChatAgent>> & { query?: string }
  ) {
    const { query, where = {} } = options || {};
    delete options.query;
    delete options.where;

    if (query) {
      (where as any).name = {
        [Op.like]: `%${query}%`,
      };
    }
    const agents = await ChatAgent.findAll({
      order: [["name", "ASC"]],
      where,
      ...options,
    });

    if (!agents) {
      return [];
    }
    return agents.map((agent) => agent.toJSON());
  }

  private async findOne(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<ChatAgent>> & {
      where: WhereOptions<ChatAgent>;
    }
  ) {
    const agent = await ChatAgent.findOne(options);
    return agent?.toJSON();
  }

  private async create(
    _event: IpcMainEvent,
    data: { name: string; description: string; language: string; config: any }
  ) {
    const agent = await ChatAgent.create(data);
    return agent.toJSON();
  }

  private async update(
    _event: IpcMainEvent,
    id: string,
    data: {
      name: string;
      description: string;
      language: string;
      config: any;
    }
  ) {
    const agent = await ChatAgent.findByPk(id);
    if (!agent) {
      throw new Error(t("models.chatAgents.notFound"));
    }
    await agent.update(data);
    return agent.toJSON();
  }

  private async destroy(_event: IpcMainEvent, id: string) {
    const agent = await ChatAgent.findByPk(id);
    if (!agent) {
      throw new Error(t("models.chatAgents.notFound"));
    }
    await agent.destroy();
    return agent.toJSON();
  }

  register() {
    ipcMain.handle("chat-agents-find-all", this.findAll);
    ipcMain.handle("chat-agents-find-one", this.findOne);
    ipcMain.handle("chat-agents-create", this.create);
    ipcMain.handle("chat-agents-update", this.update);
    ipcMain.handle("chat-agents-destroy", this.destroy);
  }
}

export const chatAgentsHandler = new ChatAgentsHandler();
