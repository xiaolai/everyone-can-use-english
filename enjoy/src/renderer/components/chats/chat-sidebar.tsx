import { PlusIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  Input,
  ScrollArea,
} from "@renderer/components/ui";
import { t } from "i18next";
import { useContext, useEffect, useState } from "react";
import {
  ChatProviderContext,
} from "@renderer/context";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ChatForm } from "./chat-form";
import { ChatAgents } from "./chat-agents";
import { useDebounce } from "@uidotdev/usehooks";

export const ChatSidebar = () => {
  const {
    chats,
    fetchChats,
    currentChat,
    setCurrentChat,
    chatAgents,
    createChat,
  } = useContext(ChatProviderContext);

  const [displayChatForm, setDisplayChatForm] = useState(false);
  const [displayAgentForm, setDisplayAgentForm] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    fetchChats(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <ScrollArea className="h-screen w-64 bg-muted border-r">
      <div className="flex items-center justify-around px-2 py-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="rounded-full"
          placeholder={t("search")}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="">
              <PlusIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setDisplayChatForm(true)}>
              {t("addChat")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDisplayAgentForm(true)}>
              {t("addAgent")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {chats.length === 0 && (
        <div className="text-center my-4">
          <span className="text-sm text-muted-foreground">{t("noData")}</span>
        </div>
      )}
      <div className="flex flex-col space-y-2 px-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`rounded-lg border py-2 px-4 hover:bg-background cursor-pointer ${
              currentChat?.id === chat.id ? "bg-background" : ""
            }`}
            onClick={() => setCurrentChat(chat)}
          >
            <div className="text-sm line-clamp-1 mb-2">
              {chat.name}({chat.membersCount})
            </div>
            <div className="flex items-center -space-x-2 justify-end">
              {chat.members.map((member) => (
                <Avatar
                  key={member.id}
                  className="w-6 h-6 border bg-background"
                >
                  <img src={(member.agent || member.user).avatarUrl} />
                  <AvatarFallback>
                    {(member.agent || member.user).name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={displayChatForm} onOpenChange={setDisplayChatForm}>
        <DialogContent className="max-w-screen-md h-5/6">
          <DialogTitle className="sr-only"></DialogTitle>
          <ScrollArea className="h-full px-4">
            <ChatForm
              chatAgents={chatAgents}
              onSave={(data) =>
                createChat(data).then(() => setDisplayChatForm(false))
              }
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <Dialog open={displayAgentForm} onOpenChange={setDisplayAgentForm}>
        <DialogContent className="max-w-screen-md h-5/6 p-0">
          <DialogTitle className="sr-only"></DialogTitle>
          <ChatAgents />
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
};
