import { ipcMain } from "electron";
import settings from "@main/settings";
import { Sequelize } from "sequelize-typescript";
import { Umzug, SequelizeStorage, Resolver, RunnableMigration } from "umzug";
import {
  Audio,
  Recording,
  CacheObject,
  Conversation,
  Message,
  Note,
  PronunciationAssessment,
  Segment,
  Speech,
  Transcription,
  Video,
  Chat,
  ChatAgent,
  ChatMember,
  ChatMessage,
  ChatSession,
} from "./models";
import {
  audiosHandler,
  cacheObjectsHandler,
  conversationsHandler,
  messagesHandler,
  notesHandler,
  pronunciationAssessmentsHandler,
  recordingsHandler,
  segmentsHandler,
  speechesHandler,
  transcriptionsHandler,
  videosHandler,
  chatAgentsHandler,
  chatMembersHandler,
  chatMessagesHandler,
  chatSessionsHandler,
  chatsHandler,
} from "./handlers";
import os from "os";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {
  connection: null as Sequelize | null,
  connect: async () => {},
  registerIpcHandlers: () => {},
};

db.connect = async () => {
  if (db.connection) {
    return;
  }
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: settings.dbPath(),
    models: [
      Audio,
      CacheObject,
      Conversation,
      Message,
      Note,
      PronunciationAssessment,
      Recording,
      Segment,
      Speech,
      Transcription,
      Video,
      Chat,
      ChatAgent,
      ChatMember,
      ChatMessage,
      ChatSession,
    ],
  });

  db.connection = sequelize;

  const migrationResolver: Resolver<unknown> = ({
    name,
    path: filepath,
    context,
  }) => {
    if (!filepath) {
      throw new Error(
        `Can't use default resolver for non-filesystem migrations`
      );
    }

    const loadModule: () => Promise<RunnableMigration<unknown>> = async () => {
      if (os.platform() === "win32") {
        return import(`file://${filepath}`) as Promise<
          RunnableMigration<unknown>
        >;
      } else {
        return import(filepath) as Promise<RunnableMigration<unknown>>;
      }
    };

    const getModule = async () => {
      return await loadModule();
    };

    return {
      name,
      path: filepath,
      up: async () => (await getModule()).up({ path: filepath, name, context }),
      down: async () =>
        (await getModule()).down?.({ path: filepath, name, context }),
    };
  };

  const umzug = new Umzug({
    migrations: {
      glob: ["migrations/*.js", { cwd: __dirname }],
      resolve: migrationResolver,
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  // migrate up to the latest state
  await umzug.up();

  await sequelize.query("PRAGMA foreign_keys = false;");
  await sequelize.sync();
  await sequelize.authenticate();

  // kill the zombie transcribe processes
  Transcription.findAll({
    where: {
      state: "processing",
    },
  }).then((transcriptions) => {
    transcriptions.forEach((transcription) => {
      if (transcription.result) {
        transcription.update({ state: "finished" });
      } else {
        transcription.update({ state: "pending" });
      }
    });
  });

  // vacuum the database
  await sequelize.query("VACUUM");

  // register handlers
  audiosHandler.register();
  cacheObjectsHandler.register();
  conversationsHandler.register();
  messagesHandler.register();
  notesHandler.register();
  pronunciationAssessmentsHandler.register();
  recordingsHandler.register();
  segmentsHandler.register();
  speechesHandler.register();
  transcriptionsHandler.register();
  videosHandler.register();
  chatAgentsHandler.register();
  chatMembersHandler.register();
  chatMessagesHandler.register();
  chatSessionsHandler.register();
  chatsHandler.register();
};

db.registerIpcHandlers = () => {
  ipcMain.handle("db-init", async () => {
    return db
      .connect()
      .then(() => {
        return {
          state: "connected",
        };
      })
      .catch((err) => {
        return {
          state: "error",
          error: err.message,
        };
      });
  });
};

export default db;
