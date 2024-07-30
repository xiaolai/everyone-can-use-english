import {
  Avatar,
  AvatarFallback,
  Button,
  Input,
  ScrollArea,
} from "@renderer/components/ui";
import { ChatAgentForm } from "@renderer/components";
import { PlusCircleIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { t } from "i18next";
import { useDebounce } from "@uidotdev/usehooks";
import { ChatProviderContext } from "@renderer/context";

export const ChatAgents = () => {
  const {
    chatAgents,
    fetchChatAgents,
    updateChatAgent,
    createChatAgent,
    destroyChatAgent,
  } = useContext(ChatProviderContext);
  const [selected, setSelected] = useState<ChatAgentType>();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    fetchChatAgents(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <div className="grid grid-cols-3 overflow-hidden h-full">
      <ScrollArea className="h-full col-span-1 bg-muted/50 p-4">
        <div className="sticky flex items-center space-x-2 mb-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-full"
            placeholder={t("search")}
          />
          <Button
            onClick={() => setSelected(null)}
            className="w-8 h-8"
            variant="ghost"
            size="icon"
          >
            <PlusCircleIcon className="w-5 h-5" />
          </Button>
        </div>
        {chatAgents.length === 0 && (
          <div className="text-center my-4">
            <span className="text-sm text-muted-foreground">{t("noData")}</span>
          </div>
        )}
        <div className="space-y-2">
          {chatAgents.map((chatAgent) => (
            <div
              key={chatAgent.id}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg cursor-pointer hover:bg-background hover:border ${
                chatAgent.id === selected?.id ? "bg-background border" : ""
              }`}
              onClick={() => setSelected(chatAgent)}
            >
              <Avatar className="w-12 h-12">
                <img src={chatAgent.avatarUrl} alt={chatAgent.name} />
                <AvatarFallback>{chatAgent.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm line-clamp-1">{chatAgent.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {chatAgent.introduction}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea className="h-full col-span-2 py-6 px-10">
        <ChatAgentForm
          agent={selected}
          onSave={(data) => {
            if (selected) {
              updateChatAgent(selected.id, data);
            } else {
              createChatAgent(data).then(() => setSelected(null));
            }
          }}
          onDestroy={() => {
            if (!selected) return;
            destroyChatAgent(selected.id);
            setSelected(null);
          }}
        />
      </ScrollArea>
    </div>
  );
};
