import { Avatar, AvatarFallback, AvatarImage } from "@renderer/components/ui";
import { MarkdownWrapper } from "@renderer/components";
import { formatDateTime } from "@renderer/lib/utils";

export const ChatSession = (props: { chatSession: ChatSessionType }) => {
  const {
    chatSession: { messages = [] },
  } = props;

  return (
    <>
      {messages.map((message) => (
        <ChatMessage key={message.id} chatMessage={message} />
      ))}
    </>
  );
};

export const ChatMessage = (props: { chatMessage: ChatMessageType }) => {
  const { chatMessage } = props;

  if (chatMessage.member?.userType === "Agent") {
    return (
      <div className="flex items-center">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="w-8 h-8 bg-background avatar">
            <AvatarImage src={chatMessage.member.agent.avatarUrl}></AvatarImage>
            <AvatarFallback className="bg-background">
              {chatMessage.member.agent.name}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm text-muted-foreground">
            {chatMessage.member.agent.name}
          </div>
        </div>
        <div className="flex flex-col gap-4 px-4 py-2 mb-2 bg-background border rounded-lg shadow-sm max-w-full">
          <MarkdownWrapper className="select-text prose dark:prose-invert">
            {chatMessage.content}
          </MarkdownWrapper>
        </div>
      </div>
    );
  } else if (chatMessage.member?.userType === "User") {
    return (
      <div className="mb-6">
        <div className="flex items-center space-x-2 justify-end mb-2">
          <div className="text-sm text-muted-foreground">
            {chatMessage.member.user.name}
          </div>
          <Avatar className="w-8 h-8 bg-background avatar">
            <AvatarImage src={chatMessage.member.user.avatarUrl}></AvatarImage>
            <AvatarFallback className="bg-background">
              {chatMessage.member.user.name}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col gap-2 px-4 py-2 mb-2 bg-sky-500/30 border-sky-500 rounded-lg shadow-sm max-w-full">
          <MarkdownWrapper className="select-text prose dark:prose-invert">
            {chatMessage.content}
          </MarkdownWrapper>
        </div>
        <div className="flex justify-end text-xs text-muted-foreground timestamp">
          {formatDateTime(chatMessage.createdAt)}
        </div>
      </div>
    );
  }
};
