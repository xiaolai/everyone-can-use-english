import { createContext, useContext, useEffect, useState } from "react";

type ChatProviderState = {
  chats: ChatType[];
  currentChat: ChatType;
  setCurrentChat: (chat: ChatType) => void;
};

const initialState: ChatProviderState = {
  chats: [],
  currentChat: null,
  setCurrentChat: () => null,
};

export const ChatProviderContext =
  createContext<ChatProviderState>(initialState);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType>(null);

  useEffect(() => {
    if (currentChat) return;

    setCurrentChat(chats[0]);
  }, [chats]);

  return (
    <ChatProviderContext.Provider
      value={{ chats, currentChat, setCurrentChat }}
    >
      {children}
    </ChatProviderContext.Provider>
  );
};
