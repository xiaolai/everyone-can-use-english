import {
  Avatar,
  AvatarFallback,
  Button,
  Input,
  ScrollArea,
} from "@renderer/components/ui";
import { ChatAgentForm } from "@renderer/components";
import { PlusCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { t } from "i18next";
import { useDebounce } from "@uidotdev/usehooks";

export const ChatAgents = () => {
  const [agents, setAgents] = useState<ChatAgentType[]>([]);
  const [selected, setSelected] = useState<ChatAgentType | null>();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const fetchAgents = async (q: string) => {};

  useEffect(() => {
    fetchAgents(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <div className="grid grid-cols-3 overflow-hidden h-full">
      <ScrollArea className="h-full col-span-1 bg-muted/50 p-4">
        <div className="sticky flex items-center space-x-2">
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
        <div className="space-y-2 px-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`flex items-center space-x-2 p-2 rounded ${
                agent.id === selected?.id ? "bg-background border" : ""
              }`}
            >
              <Avatar className="w-8 h-8">
                <img src={agent.avatarUrl} alt={agent.name} />
                <AvatarFallback>{agent.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm truncate">{agent.name}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea className="h-full col-span-2 py-6 px-10">
        <ChatAgentForm agent={selected} />
      </ScrollArea>
    </div>
  );
};
