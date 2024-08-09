// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { version } from "../package.json";
import { Timeline } from "echogarden/dist/utilities/Timeline";

contextBridge.exposeInMainWorld("__ENJOY_APP__", {
  app: {
    getPlatformInfo: () => {
      return ipcRenderer.invoke("app-platform-info");
    },
    reset: () => {
      ipcRenderer.invoke("app-reset");
    },
    resetSettings: () => {
      ipcRenderer.invoke("app-reset-settings");
    },
    relaunch: () => {
      ipcRenderer.invoke("app-relaunch");
    },
    reload: () => {
      ipcRenderer.invoke("app-reload");
    },
    isPackaged: () => {
      return ipcRenderer.invoke("app-is-packaged");
    },
    apiUrl: () => {
      return ipcRenderer.invoke("app-api-url");
    },
    wsUrl: () => {
      return ipcRenderer.invoke("app-ws-url");
    },
    quit: () => {
      ipcRenderer.invoke("app-quit");
    },
    openDevTools: () => {
      ipcRenderer.invoke("app-open-dev-tools");
    },
    createIssue: (title: string, body: string) => {
      return ipcRenderer.invoke("app-create-issue", title, body);
    },
    onCmdOutput: (
      callback: (event: IpcRendererEvent, data: string) => void
    ) => {
      ipcRenderer.on("app-on-cmd-output", callback);
    },
    removeCmdOutputListeners: () => {
      ipcRenderer.removeAllListeners("app-on-cmd-output");
    },
    version,
  },
  window: {
    onResize: (
      callback: (
        event: IpcRendererEvent,
        bounds: { x: number; y: number; width: number; height: number }
      ) => void
    ) => ipcRenderer.on("window-on-resize", callback),
    removeListeners: () => {
      ipcRenderer.removeAllListeners("window-on-resize");
    },
  },
  system: {
    preferences: {
      mediaAccess: (mediaType: "microphone" | "camera") => {
        return ipcRenderer.invoke("system-preferences-media-access", mediaType);
      },
    },
    proxy: {
      get: () => {
        return ipcRenderer.invoke("system-proxy-get");
      },
      set: (config: ProxyConfigType) => {
        return ipcRenderer.invoke("system-proxy-set", config);
      },
    },
  },
  providers: {
    audible: {
      categories: () => {
        return ipcRenderer.invoke("audible-provider-categories");
      },
      bestsellers: (params: {
        category?: string;
        page?: number;
        pageSize?: number;
      }) => {
        return ipcRenderer.invoke("audible-provider-bestsellers", params);
      },
    },
    ted: {
      talks: () => {
        return ipcRenderer.invoke("ted-provider-talks");
      },
      ideas: () => {
        return ipcRenderer.invoke("ted-provider-ideas");
      },
      downloadTalk: (url: string) => {
        return ipcRenderer.invoke("ted-provider-download-talk", url);
      },
    },
    youtube: {
      videos: (channel: string) => {
        return ipcRenderer.invoke("youtube-provider-videos", channel);
      },
    },
  },
  view: {
    load: (
      url: string,
      bounds?: { x: number; y: number; width: number; height: number },
      options?: { navigatable?: boolean }
    ) => {
      return ipcRenderer.invoke("view-load", url, bounds, options);
    },
    hide: () => {
      return ipcRenderer.invoke("view-hide");
    },
    remove: () => {
      return ipcRenderer.invoke("view-remove");
    },
    show: (bounds: { x: number; y: number; width: number; height: number }) => {
      return ipcRenderer.invoke("view-show", bounds);
    },
    scrape: (url: string) => {
      return ipcRenderer.invoke("view-scrape", url);
    },
    onViewState: (
      callback: (
        event: IpcRendererEvent,
        state: { state: string; error?: string; url?: string; html?: string }
      ) => void
    ) => ipcRenderer.on("view-on-state", callback),
    removeViewStateListeners: () => {
      ipcRenderer.removeAllListeners("view-on-state");
    },
  },
  onNotification: (
    callback: (event: IpcRendererEvent, notification: NotificationType) => void
  ) => ipcRenderer.on("on-notification", callback),
  onLookup: (
    callback: (
      event: IpcRendererEvent,
      selection: string,
      position: { x: number; y: number }
    ) => void
  ) => ipcRenderer.on("on-lookup", callback),
  offLookup: () => {
    ipcRenderer.removeAllListeners("on-lookup");
  },
  onTranslate: (
    callback: (
      event: IpcRendererEvent,
      selection: string,
      position: { x: number; y: number }
    ) => void
  ) => ipcRenderer.on("on-translate", callback),
  shell: {
    openExternal: (url: string) =>
      ipcRenderer.invoke("shell-open-external", url),
    openPath: (path: string) => ipcRenderer.invoke("shell-open-path", path),
  },
  dialog: {
    showOpenDialog: (options: Electron.OpenDialogOptions) =>
      ipcRenderer.invoke("dialog-show-open-dialog", options),
    showSaveDialog: (options: Electron.SaveDialogOptions) =>
      ipcRenderer.invoke("dialog-show-save-dialog", options),
    showMessageBox: (options: Electron.MessageBoxOptions) =>
      ipcRenderer.invoke("dialog-show-message-box", options),
    showErrorBox: (title: string, content: string) =>
      ipcRenderer.invoke("dialog-show-error-box", title, content),
  },
  settings: {
    get: (key: string) => {
      return ipcRenderer.invoke("settings-get", key);
    },
    set: (key: string, value: any) => {
      return ipcRenderer.invoke("settings-set", key, value);
    },
    getLibrary: () => {
      return ipcRenderer.invoke("settings-get-library");
    },
    setLibrary: (library: string) => {
      return ipcRenderer.invoke("settings-set-library", library);
    },
    getUser: () => {
      return ipcRenderer.invoke("settings-get-user");
    },
    setUser: (user: UserType) => {
      return ipcRenderer.invoke("settings-set-user", user);
    },
    getUserDataPath: () => {
      return ipcRenderer.invoke("settings-get-user-data-path");
    },
    getDefaultEngine: () => {
      return ipcRenderer.invoke("settings-get-default-engine");
    },
    setDefaultEngine: (engine: "enjoyai" | "openai") => {
      return ipcRenderer.invoke("settings-set-default-engine", engine);
    },
    getGptEngine: () => {
      return ipcRenderer.invoke("settings-get-gpt-engine");
    },
    setGptEngine: (engine: GptEngineSettingType) => {
      return ipcRenderer.invoke("settings-set-gpt-engine", engine);
    },
    getLlm: (provider: string) => {
      return ipcRenderer.invoke("settings-get-llm", provider);
    },
    setLlm: (provider: string, config: LlmProviderType) => {
      return ipcRenderer.invoke("settings-set-llm", provider, config);
    },
    getLanguage: (language: string) => {
      return ipcRenderer.invoke("settings-get-language", language);
    },
    switchLanguage: (language: string) => {
      return ipcRenderer.invoke("settings-switch-language", language);
    },
    getDefaultHotkeys: () => {
      return ipcRenderer.invoke("settings-get-default-hotkeys");
    },
    setDefaultHotkeys: (records: Record<string, string>) => {
      return ipcRenderer.invoke("settings-set-default-hotkeys", records);
    },
    getApiUrl: () => {
      return ipcRenderer.invoke("settings-get-api-url");
    },
    setApiUrl: (url: string) => {
      return ipcRenderer.invoke("settings-set-api-url", url);
    },
  },
  path: {
    join: (...paths: string[]) => {
      return ipcRenderer.invoke("path-join", ...paths);
    },
  },
  db: {
    init: () => ipcRenderer.invoke("db-init"),
    onTransaction: (
      callback: (
        event: IpcRendererEvent,
        state: {
          model: string;
          id: string;
          action: "create" | "update" | "destroy";
        }
      ) => void
    ) => ipcRenderer.on("db-on-transaction", callback),
    removeListeners: () => {
      ipcRenderer.removeAllListeners("db-on-transaction");
    },
  },
  camdict: {
    lookup: (word: string) => {
      return ipcRenderer.invoke("camdict-lookup", word);
    },
  },
  audios: {
    findAll: (params: {
      offset: number | undefined;
      limit: number | undefined;
    }) => {
      return ipcRenderer.invoke("audios-find-all", params);
    },
    findOne: (params: any) => {
      return ipcRenderer.invoke("audios-find-one", params);
    },
    create: (uri: string, params?: any) => {
      return ipcRenderer.invoke("audios-create", uri, params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("audios-update", id, params);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("audios-destroy", id);
    },
    upload: (id: string) => {
      return ipcRenderer.invoke("audios-upload", id);
    },
    crop: (id: string, params: { startTime: number; endTime: number }) => {
      return ipcRenderer.invoke("audios-crop", id, params);
    },
  },
  videos: {
    findAll: (params: {
      offset: number | undefined;
      limit: number | undefined;
    }) => {
      return ipcRenderer.invoke("videos-find-all", params);
    },
    findOne: (params: any) => {
      return ipcRenderer.invoke("videos-find-one", params);
    },
    create: (uri: string, params?: any) => {
      return ipcRenderer.invoke("videos-create", uri, params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("videos-update", id, params);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("videos-destroy", id);
    },
    upload: (id: string) => {
      return ipcRenderer.invoke("videos-upload", id);
    },
    crop: (id: string, params: { startTime: number; endTime: number }) => {
      return ipcRenderer.invoke("videos-crop", id, params);
    },
  },
  recordings: {
    findAll: (params?: {
      targetId?: string;
      targetType?: string;
      offset?: number;
      limit?: number;
    }) => {
      return ipcRenderer.invoke("recordings-find-all", params);
    },
    findOne: (params: any) => {
      return ipcRenderer.invoke("recordings-find-one", params);
    },
    sync: (id: string) => {
      return ipcRenderer.invoke("recordings-sync", id);
    },
    syncAll: () => {
      return ipcRenderer.invoke("recordings-sync-all");
    },
    create: (params: any) => {
      return ipcRenderer.invoke("recordings-create", params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("recordings-update", id, params);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("recordings-destroy", id);
    },
    upload: (id: string) => {
      return ipcRenderer.invoke("recordings-upload", id);
    },
    stats: (params: { from: string; to: string }) => {
      return ipcRenderer.invoke("recordings-stats", params);
    },
    groupByDate: (params: { from: string; to: string }) => {
      return ipcRenderer.invoke("recordings-group-by-date", params);
    },
    groupByTarget: (params: { from: string; to: string }) => {
      return ipcRenderer.invoke("recordings-group-by-target", params);
    },
    groupBySegment: (targetId: string, targetType: string) => {
      return ipcRenderer.invoke(
        "recordings-group-by-segment",
        targetId,
        targetType
      );
    },
  },
  conversations: {
    findAll: (params: { where?: any; offset?: number; limit?: number }) => {
      return ipcRenderer.invoke("conversations-find-all", params);
    },
    findOne: (params: any) => {
      return ipcRenderer.invoke("conversations-find-one", params);
    },
    create: (params: any) => {
      return ipcRenderer.invoke("conversations-create", params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("conversations-update", id, params);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("conversations-destroy", id);
    },
  },
  pronunciationAssessments: {
    findAll: (params: { where?: any; offset?: number; limit?: number }) => {
      return ipcRenderer.invoke("pronunciation-assessments-find-all", params);
    },
    findOne: (params: any) => {
      return ipcRenderer.invoke("pronunciation-assessments-find-one", params);
    },
    create: (params: any) => {
      return ipcRenderer.invoke("pronunciation-assessments-create", params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("pronunciation-assessments-update", id, params);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("pronunciation-assessments-destroy", id);
    },
  },
  messages: {
    findAll: (params: { where?: any; offset?: number; limit?: number }) => {
      return ipcRenderer.invoke("messages-find-all", params);
    },
    findOne: (where: any) => {
      return ipcRenderer.invoke("messages-find-one", where);
    },
    createInBatch: (messages: Partial<MessageType>[]) => {
      return ipcRenderer.invoke("messages-create-in-batch", messages);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("messages-destroy", id);
    },
    createSpeech: (id: string, configuration?: { [key: string]: any }) => {
      return ipcRenderer.invoke("messages-create-speech", id, configuration);
    },
  },
  speeches: {
    findOne: (where: any) => {
      return ipcRenderer.invoke("speeches-find-one", where);
    },
    create: (
      params: {
        sourceId: string;
        sourceType: string;
        text: string;
        configuration: {
          engine: string;
          model: string;
          voice: string;
        };
      },
      blob: { type: string; arrayBuffer: ArrayBuffer }
    ) => {
      return ipcRenderer.invoke("speeches-create", params, blob);
    },
  },
  audiowaveform: {
    generate: (
      file: string,
      options?: {
        force: boolean;
        extra: string[];
      }
    ) => {
      return ipcRenderer.invoke("audiowaveform-generate", file, options);
    },
    frequencies: (file: string) => {
      return ipcRenderer.invoke("audiowaveform-frequencies", file);
    },
  },
  echogarden: {
    align: (input: string, transcript: string, options: any) => {
      return ipcRenderer.invoke("echogarden-align", input, transcript, options);
    },
    alignSegments: (input: string, timeline: Timeline, options: any) => {
      return ipcRenderer.invoke(
        "echogarden-align-segments",
        input,
        timeline,
        options
      );
    },
    wordToSentenceTimeline: (
      wordTimeline: Timeline,
      transcript: string,
      language: string
    ) => {
      return ipcRenderer.invoke(
        "echogarden-word-to-sentence-timeline",
        wordTimeline,
        transcript,
        language
      );
    },
    transcode: (input: string) => {
      return ipcRenderer.invoke("echogarden-transcode", input);
    },
    check: () => {
      return ipcRenderer.invoke("echogarden-check");
    },
  },
  whisper: {
    config: () => {
      return ipcRenderer.invoke("whisper-config");
    },
    setModel: (model: string) => {
      return ipcRenderer.invoke("whisper-set-model", model);
    },
    setService: (service: string) => {
      return ipcRenderer.invoke("whisper-set-service", service);
    },
    check: () => {
      return ipcRenderer.invoke("whisper-check");
    },
    transcribe: (
      params: {
        file?: string;
        blob?: {
          type: string;
          arrayBuffer: ArrayBuffer;
        };
      },
      options?: {
        language?: string;
        force?: boolean;
        extra?: string[];
      }
    ) => {
      return ipcRenderer.invoke("whisper-transcribe", params, options);
    },
    onProgress: (
      callback: (event: IpcRendererEvent, progress: number) => void
    ) => ipcRenderer.on("whisper-on-progress", callback),
    abort: () => {
      return ipcRenderer.invoke("whisper-abort");
    },
    removeProgressListeners: () => {
      ipcRenderer.removeAllListeners("whisper-on-progress");
    },
  },
  ffmpeg: {
    check: () => {
      return ipcRenderer.invoke("ffmpeg-check-command");
    },
    transcode: (input: string, output: string, options: string[]) => {
      return ipcRenderer.invoke("ffmpeg-transcode", input, output, options);
    },
  },
  download: {
    onState: (
      callback: (event: IpcRendererEvent, state: DownloadStateType) => void
    ) => ipcRenderer.on("download-on-state", callback),
    start: (url: string, savePath?: string) => {
      return ipcRenderer.invoke("download-start", url, savePath);
    },
    printAsPdf: (content: string, savePath: string) => {
      return ipcRenderer.invoke("print-as-pdf", content, savePath);
    },
    cancel: (filename: string) => {
      ipcRenderer.invoke("download-cancel", filename);
    },
    cancelAll: () => {
      ipcRenderer.invoke("download-cancel-all");
    },
    dashboard: () => {
      return ipcRenderer.invoke("download-dashboard");
    },
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners("download-on-error");
    },
  },
  cacheObjects: {
    get: (key: string) => {
      return ipcRenderer.invoke("cache-objects-get", key);
    },
    set: (key: string, value: string | any, ttl?: number) => {
      return ipcRenderer.invoke("cache-objects-set", key, value, ttl);
    },
    delete: (key: string) => {
      return ipcRenderer.invoke("cache-objects-delete", key);
    },
    clear: () => {
      return ipcRenderer.invoke("cache-objects-clear");
    },
    writeFile: (filename: string, data: ArrayBuffer) => {
      return ipcRenderer.invoke("cache-objects-write-file", filename, data);
    },
  },
  transcriptions: {
    findOrCreate: (params: any) => {
      return ipcRenderer.invoke("transcriptions-find-or-create", params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("transcriptions-update", id, params);
    },
  },
  waveforms: {
    find: (id: string) => {
      return ipcRenderer.invoke("waveforms-find", id);
    },
    save: (id: string, data: WaveFormDataType) => {
      return ipcRenderer.invoke("waveforms-save", id, data);
    },
  },
  segments: {
    findAll: (params: {
      targetId?: string;
      targetType?: string;
      offset?: number;
      limit?: number;
    }) => {
      return ipcRenderer.invoke("segments-find-all", params);
    },
    find: (id: string) => {
      return ipcRenderer.invoke("segments-find", id);
    },
    create: (params: any) => {
      return ipcRenderer.invoke("segments-create", params);
    },
    sync: (id: string) => {
      return ipcRenderer.invoke("segments-sync", id);
    },
  },
  notes: {
    groupByTarget: (params?: { limit?: number; offset?: number }) => {
      return ipcRenderer.invoke("notes-group-by-target", params);
    },
    groupBySegment: (targetId: string, targetType: string) => {
      return ipcRenderer.invoke("notes-group-by-segment", targetId, targetType);
    },
    findAll: (params: {
      targetId?: string;
      targetType?: string;
      offset?: number;
      limit?: number;
    }) => {
      return ipcRenderer.invoke("notes-find-all", params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("notes-update", id, params);
    },
    delete: (id: string) => {
      return ipcRenderer.invoke("notes-delete", id);
    },
    create: (params: any) => {
      return ipcRenderer.invoke("notes-create", params);
    },
    sync: (id: string) => {
      return ipcRenderer.invoke("notes-sync", id);
    },
  },
  chats: {
    findAll: (params: { query?: string; offset?: number; limit?: number }) => {
      return ipcRenderer.invoke("chats-find-all", params);
    },
    findOne: (params: any) => {
      return ipcRenderer.invoke("chats-find-one", params);
    },
    create: (params: any) => {
      return ipcRenderer.invoke("chats-create", params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("chats-update", id, params);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("chats-destroy", id);
    },
  },
  chatAgents: {
    findAll: (params: { query?: string; offset?: number; limit?: number }) => {
      return ipcRenderer.invoke("chat-agents-find-all", params);
    },
    findOne: (params: any) => {
      return ipcRenderer.invoke("chat-agents-find-one", params);
    },
    create: (params: any) => {
      return ipcRenderer.invoke("chat-agents-create", params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("chat-agents-update", id, params);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("chat-agents-destroy", id);
    },
  },
  chatSessions: {
    findAll: (params: { chatId: string; offset?: number; limit?: number }) => {
      return ipcRenderer.invoke("chat-sessions-find-all", params);
    },
    findOne: (params: any) => {
      return ipcRenderer.invoke("chat-sessions-find-one", params);
    },
    create: (params: any) => {
      return ipcRenderer.invoke("chat-sessions-create", params);
    },
    invoke: (id: string, params: any) => {
      return ipcRenderer.invoke("chat-sessions-invoke", id, params);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("chat-sessions-destroy", id);
    },
  },
  chatMessages: {
    findAll: (params: { chatSessionId: string; offset?: number; limit?: number }) => {
      return ipcRenderer.invoke("chat-messages-find-all", params);
    },
    findOne: (params: any) => {
      return ipcRenderer.invoke("chat-messages-find-one", params);
    },
    create: (params: any) => {
      return ipcRenderer.invoke("chat-messages-create", params);
    },
    update: (id: string, params: any) => {
      return ipcRenderer.invoke("chat-messages-update", id, params);
    },
    destroy: (id: string) => {
      return ipcRenderer.invoke("chat-messages-destroy", id);
    },
  },
});
