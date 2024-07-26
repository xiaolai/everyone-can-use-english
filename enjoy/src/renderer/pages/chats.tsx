import { Chat, ChatSidebar } from "@renderer/components";

export default function Chats() {
  return (
    <div className="flex items-start w-full">
      <ChatSidebar />
      <div className="flex-1">
        <Chat />
      </div>
    </div>
  );
}
