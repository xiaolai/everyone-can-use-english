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
import { AppSettingsProviderContext } from "@renderer/context";

export const ChatSidebar = () => {
  const { user } = useContext(AppSettingsProviderContext);
  return (
    <ScrollArea className="h-screen w-64 bg-muted border-r">
      <div className="flex items-center justify-around px-2 py-4">
        <Input className="rounded-full" placeholder={t("search")} />
        <Button variant="ghost" size="icon" className="">
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col space-y-2 px-2">
        <div className="rounded-lg border py-2 px-4 hover:bg-background cursor-pointer">
          <div className="text-sm line-clamp-1 mb-2">
            Let's talk about the weather today. It's so hot outside.
          </div>
          <div className="flex items-center -space-x-1 justify-end">
            <Avatar className="w-5 h-5">
              <img src={`https://api.dicebear.com/9.x/croodles/svg?seed=A`} />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar className="w-5 h-5">
              <img src={`https://api.dicebear.com/9.x/croodles/svg?seed=B`} />
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <Avatar className="w-5 h-5">
              <img src={user.avatarUrl} />
              <AvatarFallback>{user.name}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
