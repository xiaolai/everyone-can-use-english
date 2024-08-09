import { ChatSessionProviderContext } from "@renderer/context";
import { ChatMessage } from "@renderer/components";
import { useContext } from "react";

export const ChatSessions = () => {
  const { chatSessions } = useContext(ChatSessionProviderContext);

  return (
    <div className="flex-1 space-y-4 px-4 mb-4">
      {chatSessions.map((chatSession) => (
        <ChatSession key={chatSession.id} chatSession={chatSession} />
      ))}
    </div>
  );
};

const ChatSession = (props: { chatSession: ChatSessionType }) => {
  const { messages } = props.chatSession;

  return (
    <>
      {messages.map((message) => (
        <ChatMessage key={message.id} chatMessage={message} />
      ))}
    </>
  );
};
