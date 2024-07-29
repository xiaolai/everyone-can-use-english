import { createContext, useContext, useEffect, useState } from "react";
import { useChat, useChatAgent } from "@renderer/hooks";

type ChatProviderState = {
  chats: ChatType[];
  currentChat: ChatType;
  setCurrentChat: (chat: ChatType) => void;
  fetchChats: (query?: string) => Promise<void>;
  createChat: (data: {
    name: string;
    language: string;
    topic: string;
    members: Array<{
      userId: string;
      userType: string;
    }>;
  }) => Promise<void>;
  updateChat: (
    id: string,
    data: {
      name: string;
      language: string;
      topic: string;
      members: Array<{
        userId: string;
        userType: string;
      }>;
    }
  ) => Promise<void>;
  destroyChat: (id: string) => Promise<void>;
  chatAgents: ChatAgentType[];
  fetchChatAgents: (query?: string) => Promise<void>;
  updateChatAgent: (id: string, data: Partial<ChatAgentType>) => Promise<void>;
  createChatAgent: (data: Partial<ChatAgentType>) => Promise<void>;
  destroyChatAgent: (id: string) => Promise<void>;
};

const initialState: ChatProviderState = {
  chats: [],
  currentChat: null,
  setCurrentChat: () => null,
  fetchChats: () => null,
  createChat: () => null,
  updateChat: () => null,
  destroyChat: () => null,
  chatAgents: [],
  fetchChatAgents: () => null,
  updateChatAgent: () => null,
  createChatAgent: () => null,
  destroyChatAgent: () => null,
};

export const ChatProviderContext =
  createContext<ChatProviderState>(initialState);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentChat, setCurrentChat] = useState<ChatType>(null);
  const { chats, fetchChats, createChat, updateChat, destroyChat } = useChat();
  const {
    chatAgents,
    fetchChatAgents,
    updateChatAgent,
    createChatAgent,
    destroyChatAgent,
  } = useChatAgent();

  useEffect(() => {
    if (currentChat) return;

    setCurrentChat(chats[0]);
  }, [chats]);

  return (
    <ChatProviderContext.Provider
      value={{
        chats,
        fetchChats,
        currentChat,
        setCurrentChat,
        chatAgents,
        createChat,
        updateChat,
        destroyChat,
        fetchChatAgents,
        updateChatAgent,
        createChatAgent,
        destroyChatAgent,
      }}
    >
      {children}
    </ChatProviderContext.Provider>
  );
};
