import { PlusIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Button,
  Input,
  ScrollArea,
} from "@renderer/components/ui";
import { t } from "i18next";
import { useContext } from "react";
import {
  AppSettingsProviderContext,
  ChatProviderContext,
} from "@renderer/context";

export const ChatSidebar = () => {
  const { user } = useContext(AppSettingsProviderContext);
  const { chats, currentChat, setCurrentChat } =
    useContext(ChatProviderContext);

  return (
    <ScrollArea className="h-screen w-64 bg-muted border-r">
      <div className="flex items-center justify-around px-2 py-4">
        <Input className="rounded-full" placeholder={t("search")} />
        <Button variant="ghost" size="icon" className="">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      {chats.length === 0 && (
        <div className="text-center my-4">
          <span className="text-sm text-muted-foreground">{t("noData")}</span>
        </div>
      )}
      <div className="flex flex-col space-y-2 px-2">
        {chats.map((chat) => (
          <div
            id={chat.id}
            className={`rounded-lg border py-2 px-4 hover:bg-background cursor-pointer ${
              currentChat?.id === chat.id ? "bg-background" : ""
            }`}
            onClick={() => setCurrentChat(chat)}
          >
            <div className="text-sm line-clamp-1 mb-2">
              {chat.name}({chat.members.length})
            </div>
            <div className="flex items-center -space-x-1 justify-end">
              {chat.members.map((member) => (
                <Avatar key={member.id} className="w-5 h-5">
                  <img src={member.avatarUrl} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
