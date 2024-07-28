import {
  Avatar,
  AvatarFallback,
  Button,
  Input,
  ScrollArea,
  toast,
} from "@renderer/components/ui";
import { ChatAgentForm } from "@renderer/components";
import { PlusCircleIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { t } from "i18next";
import { useDebounce } from "@uidotdev/usehooks";
import { AppSettingsProviderContext } from "@renderer/context";

export const ChatAgents = () => {
  const { EnjoyApp } = useContext(AppSettingsProviderContext);
  const [agents, setAgents] = useState<ChatAgentType[]>([]);
  const [selected, setSelected] = useState<ChatAgentType | null>();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const fetchAgents = async (q: string) => {
    EnjoyApp.chatAgents
      .findAll({ query: q })
      .then((data) => {
        setAgents(data);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  useEffect(() => {
    fetchAgents(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <div className="grid grid-cols-3 overflow-hidden h-full">
      <ScrollArea className="h-full col-span-1 bg-muted/50 p-4">
        <div className="sticky flex items-center space-x-2 mb-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-full"
            placeholder="Search"
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
        {agents.length === 0 && (
          <div className="text-center my-4">
            <span className="text-sm text-muted-foreground">{t("noData")}</span>
          </div>
        )}
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg cursor-pointer hover:bg-background hover:border ${
                agent.id === selected?.id ? "bg-background border" : ""
              }`}
              onClick={() => setSelected(agent)}
            >
              <Avatar className="w-12 h-12">
                <img src={agent.avatarUrl} alt={agent.name} />
                <AvatarFallback>{agent.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm truncate">{agent.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {agent.introduction}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea className="h-full col-span-2 py-6 px-10">
        <ChatAgentForm
          agent={selected}
          onSave={(agent: ChatAgentType) => setSelected(agent)}
        />
      </ScrollArea>
    </div>
  );
};
