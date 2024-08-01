import {
  AfterCreate,
  AfterUpdate,
  AfterDestroy,
  AfterFind,
  Table,
  Column,
  Default,
  Model,
  IsUUID,
  BelongsTo,
  Min,
  DataType,
  Unique,
  HasOne,
} from "sequelize-typescript";
import mainWindow from "@main/window";
import { Audio, PronunciationAssessment, Video } from "@main/db/models";
import fs from "fs-extra";
import path from "path";
import settings from "@main/settings";
import { hashFile } from "@main/utils";
import log from "@main/logger";
import storage from "@main/storage";
import { Client } from "@/api";
import echogarden from "@main/echogarden";
import { t } from "i18next";
import { Attributes, Transaction } from "sequelize";
import { v5 as uuidv5 } from "uuid";

const logger = log.scope("db/models/recording");

@Table({
  modelName: "Recording",
  tableName: "recordings",
  underscored: true,
  timestamps: true,
})
export class Recording extends Model<Recording> {
  @IsUUID("all")
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true, type: DataType.UUID })
  id: string;

  @Column(DataType.STRING)
  language: string;

  @BelongsTo(() => Audio, { foreignKey: "targetId", constraints: false })
  audio: Audio;

  @BelongsTo(() => Video, { foreignKey: "targetId", constraints: false })
  video: Video;

  @Column(DataType.VIRTUAL)
  target: Audio | Video;

  @IsUUID("all")
  @Default("00000000-0000-0000-0000-000000000000")
  @Column(DataType.UUID)
  targetId: string;

  @Column(DataType.STRING)
  targetType: "Audio" | "Video" | "ChatMessage" | "None";

  @HasOne(() => PronunciationAssessment, {
    foreignKey: "targetId",
    constraints: false,
  })
  pronunciationAssessment: PronunciationAssessment;

  @Unique
  @Column(DataType.STRING)
  md5: string;

  @Column(DataType.STRING)
  filename: string;

  @Column(DataType.INTEGER)
  referenceId: number;

  @Column(DataType.STRING)
  referenceText: string;

  @Min(0)
  @Column(DataType.INTEGER)
  duration: number;

  @Column(DataType.DATE)
  syncedAt: Date;

  @Column(DataType.DATE)
  uploadedAt: Date;

  @Column(DataType.VIRTUAL)
  get isSynced(): boolean {
    return Boolean(this.syncedAt) && this.syncedAt >= this.updatedAt;
  }

  @Column(DataType.VIRTUAL)
  get isUploaded(): boolean {
    return Boolean(this.uploadedAt);
  }

  @Column(DataType.VIRTUAL)
  get src(): string {
    return `enjoy://${path.posix.join(
      "library",
      "recordings",
      this.getDataValue("filename")
    )}`;
  }

  get filePath(): string {
    return path.join(
      settings.userDataPath(),
      "recordings",
      this.getDataValue("filename")
    );
  }

  async upload(force: boolean = false) {
    if (this.isUploaded && !force) {
      return;
    }

    return storage
      .put(this.md5, this.filePath)
      .then((result) => {
        logger.debug("upload result:", result.data);
        if (result.data.success) {
          this.update({ uploadedAt: new Date() });
        } else {
          throw new Error(result.data);
        }
      })
      .catch((err) => {
        logger.error("upload failed:", err.message);
        throw err;
      });
  }

  async sync() {
    if (this.isSynced) return;

    const webApi = new Client({
      baseUrl: settings.apiUrl(),
      accessToken: settings.getSync("user.accessToken") as string,
      logger,
    });

    return webApi.syncRecording(this.toJSON()).then(() => {
      this.update({ syncedAt: new Date() });
    });
  }

  @AfterFind
  static async findTarget(findResult: Recording | Recording[]) {
    if (!findResult) return;

    if (!Array.isArray(findResult)) findResult = [findResult];

    for (const instance of findResult) {
      if (instance.targetType === "Audio" && instance.audio) {
        instance.target = instance.audio.toJSON();
      }
      if (instance.targetType === "Video" && instance.video) {
        instance.target = instance.video.toJSON();
      }
      // To prevent mistakes:
      delete instance.audio;
      delete instance.dataValues.audio;
      delete instance.video;
      delete instance.dataValues.video;
    }
  }

  @AfterCreate
  static autoSync(recording: Recording) {
    // auto sync should not block the main thread
    recording.sync().catch(() => {});
  }

  @AfterCreate
  static increaseResourceCache(recording: Recording) {
    if (recording.targetType === "Audio") {
      Audio.findByPk(recording.targetId).then((audio) => {
        audio.increment("recordingsCount");
        audio.increment("recordingsDuration", {
          by: recording.duration,
        });
      });
    } else if (recording.targetType === "Video") {
      Video.findByPk(recording.targetId).then((video) => {
        video.increment("recordingsCount");
        video.increment("recordingsDuration", {
          by: recording.duration,
        });
      });
    }
  }

  @AfterCreate
  static notifyForCreate(recording: Recording) {
    this.notify(recording, "create");
  }

  @AfterUpdate
  static notifyForUpdate(recording: Recording) {
    this.notify(recording, "update");
  }

  @AfterDestroy
  static notifyForDestroy(recording: Recording) {
    this.notify(recording, "destroy");
  }

  @AfterDestroy
  static decreaseResourceCache(recording: Recording) {
    if (recording.targetType === "Audio") {
      Audio.findByPk(recording.targetId).then((audio) => {
        audio.decrement("recordingsCount");
        audio.decrement("recordingsDuration", {
          by: recording.duration,
        });
      });
    } else if (recording.targetType === "Video") {
      Video.findByPk(recording.targetId).then((video) => {
        video.decrement("recordingsCount");
        video.decrement("recordingsDuration", {
          by: recording.duration,
        });
      });
    }
  }

  @AfterDestroy
  static cleanupFile(recording: Recording) {
    fs.remove(recording.filePath);
    const webApi = new Client({
      baseUrl: settings.apiUrl(),
      accessToken: settings.getSync("user.accessToken") as string,
      logger: log.scope("recording/cleanupFile"),
    });
    webApi.deleteRecording(recording.id);
  }

  static async createFromBlob(
    blob: {
      type: string;
      arrayBuffer: ArrayBuffer;
    },
    params: Partial<Attributes<Recording>>,
    transaction?: Transaction
  ) {
    const { targetId, targetType, referenceId, referenceText, language } =
      params;
    let { duration } = params;

    if (blob.arrayBuffer.byteLength === 0) {
      throw new Error("Empty recording");
    }

    let rawAudio = await echogarden.ensureRawAudio(
      Buffer.from(blob.arrayBuffer)
    );

    // trim audio
    let trimmedSamples = echogarden.trimAudioStart(
      rawAudio.audioChannels[0],
      0,
      -50
    );
    trimmedSamples = echogarden.trimAudioEnd(trimmedSamples, 0, -50);
    rawAudio.audioChannels[0] = trimmedSamples;

    duration = Math.round(echogarden.getRawAudioDuration(rawAudio) * 1000);

    if (duration === 0) {
      throw new Error(t("models.recording.cannotDetectAnySound"));
    }

    // save recording to file
    const file = path.join(settings.cachePath(), `${Date.now()}.wav`);
    await fs.outputFile(file, echogarden.encodeRawAudioToWave(rawAudio));

    // hash file
    const md5 = await hashFile(file, { algo: "md5" });

    const existed = await Recording.findOne({ where: { md5 } });
    if (existed) {
      fs.remove(file);
      return existed;
    }

    // rename file
    const filename = `${md5}.wav`;
    fs.moveSync(
      file,
      path.join(settings.userDataPath(), "recordings", filename),
      {
        overwrite: true,
      }
    );

    const userId = settings.getSync("user.id");
    const id = uuidv5(`${userId}/${md5}`, uuidv5.URL);

    return this.create(
      {
        id,
        targetId,
        targetType,
        filename,
        duration,
        md5,
        referenceId,
        referenceText,
        language,
      },
      {
        transaction,
      }
    );
  }

  static notify(recording: Recording, action: "create" | "update" | "destroy") {
    if (!mainWindow.win) return;

    mainWindow.win.webContents.send("db-on-transaction", {
      model: "Recording",
      id: recording.id,
      action: action,
      record: recording.toJSON(),
    });
  }
}
