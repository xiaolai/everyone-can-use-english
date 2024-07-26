type ChatType = {
  id: string;
  name: string;
  topic: string;
  prompt: string;
  language: string;
  digest: string;
  createdAt: string;
  updatedAt: string;
  sessions: ChatSessionType[];
  members: ChatMemberType[];
};

type ChatMemberType = {
  id: string;
  state: "active" | "passive";
  type: "User" | "Agent";
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

type ChatSessionType = {
  id: string;
  chatId: string;
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
};
