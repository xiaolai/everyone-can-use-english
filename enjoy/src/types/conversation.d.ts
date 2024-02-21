type ConversationType = {
  id: string;
  type: "gpt" | "tts";
  engine: "enjoyai" | "openai" | "ollama" | "googleGenerativeAi";
  name: string;
  configuration: { [key: string]: any };
  model: string;
  messages?: MessageType[];
  createdAt?: string;
};
