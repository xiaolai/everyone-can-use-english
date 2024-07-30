import { ipcMain, IpcMainEvent } from "electron";
import { ChatSession } from "@main/db/models";
import { FindOptions, WhereOptions, Attributes } from "sequelize";
import log from "@main/logger";
import { t } from "i18next";
import echogarden from "@main/echogarden";
import whisper from "@/main/whisper";

const logger = log.scope("db/handlers/chats-handler");

class ChatSessionsHandler {
  private async findAll(
    _event: IpcMainEvent,
    options: FindOptions<Attributes<ChatSession>> & { query?: string }
  ) {}

  private async create(_event: IpcMainEvent, buffer: ArrayBuffer) {
    logger.debug('create chat session');
    const rawAudio = await echogarden.ensureRawAudio(
      Buffer.from(buffer),
      16000
    );
    const audioBuffer = await echogarden.encodeRawAudioToWave(rawAudio);
    const result = await whisper.transcribe({
      blob: {
        type: "audio/wav",
        arrayBuffer: audioBuffer,
      },
    });
    logger.info(result)
  }

  private async reply() {}

  register() {
    ipcMain.handle("chat-sessions-find-all", this.findAll);
    ipcMain.handle("chat-sessions-create", this.create);
    ipcMain.handle("chat-sessions-reply", this.reply);
  }
}

export const chatSessionsHandler = new ChatSessionsHandler();
