import { Chat, ChatSidebar } from "@renderer/components";
import { ChatProvider } from "@renderer/context";

export default function Chats() {
  return (
    <ChatProvider>
      <div className="flex items-start w-full">
        <ChatSidebar />
        <div className="flex-1">
          <Chat />
        </div>
      </div>
    </ChatProvider>
  );
}
