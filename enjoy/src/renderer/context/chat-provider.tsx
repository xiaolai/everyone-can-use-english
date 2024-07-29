import { createContext, useContext, useEffect, useState } from "react";
import { useChat, useChatAgent } from "@renderer/hooks";

type ChatProviderState = {
  chats: ChatType[];
  currentChat: ChatType;
  setCurrentChat: (chat: ChatType) => void;
  fetchChats: (query?: string) => Promise<void>;
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
  const { chats, fetchChats } = useChat();
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
