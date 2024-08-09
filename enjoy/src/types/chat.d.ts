type ChatType = {
  id: string;
  name: string;
  topic: string;
  language: string;
  config: {
    sttEngine: WhisperConfigType["service"];
    [key: string]: any;
  };
  digest?: string;
  createdAt: string;
  updatedAt: string;
  membersCount: number;
  sessions: ChatSessionType[];
  members: ChatMemberType[];
};

type ChatAgentType = {
  id: string;
  name: string;
  avatarUrl: string;
  introduction: string;
  language: string;
  config: {
    engine: "enjoyai" | "openai" | "ollama";
    model: string;
    prompt: string;
    temperature?: number;
    ttsEngine: "enjoyai" | "openai";
    ttsModel: string;
    ttsVoice: string;
    [key: string]: any;
  };
};

type ChatMemberType = {
  id: string;
  chatId: string;
  userId: string;
  userType: "Agent" | "User";
  config: {
    prompt?: string;
    introduction?: string;
    [key: string]: any;
  };
  agent?: ChatAgentType;
  user?: UserType;
};

type ChatSessionType = {
  id: string;
  chatId: string;
  state: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
  chat: ChatType;
  messages: ChatMessageType[];
};

type ChatMessageType = {
  id: string;
  memberId: string;
  sessionId: string;
  content: string;
  state: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
  member?: ChatMemberType;
  recording?: RecordingType;
};
