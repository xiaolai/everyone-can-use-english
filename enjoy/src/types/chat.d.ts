type ChatType = {
  id: string;
  name: string;
  topic: string;
  language: string;
  config: {
    sttEngine: WhisperConfigType["service"];
  };
  digest?: string;
  createdAt: string;
  updatedAt: string;
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
    preset: string;
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
  language: string;
  state: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
};
