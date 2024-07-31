import { Avatar, AvatarFallback } from "@renderer/components/ui";

export const ChatCard = (props: {
  chat: ChatType;
  selected?: boolean;
  onSelect: (chat: ChatType) => void;
}) => {
  const { chat, selected = false, onSelect } = props;
  return (
    <div
      key={chat.id}
      className={`rounded-lg border py-2 px-4 hover:bg-background cursor-pointer ${
        selected ? "bg-background" : ""
      }`}
      onClick={() => onSelect(chat)}
    >
      <div className="text-sm line-clamp-1 mb-2">
        {chat.name}({chat.membersCount})
      </div>
      <div className="flex items-center -space-x-2 justify-end">
        {(chat.members || []).slice(0, 5).map((member) => (
          <Avatar key={member.id} className="w-6 h-6 border bg-background">
            <img src={(member.agent || member.user).avatarUrl} />
            <AvatarFallback>
              {(member.agent || member.user).name[0]}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
};
