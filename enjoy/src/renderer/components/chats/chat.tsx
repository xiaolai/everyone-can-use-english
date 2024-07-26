import { MicIcon, SettingsIcon } from "lucide-react";
import { Button, ScrollArea } from "@renderer/components/ui";
import { t } from "i18next";

export const Chat = () => {
  return (
    <ScrollArea className="h-screen relative pb-16">
      <div className="h-12 border-b px-4 shadow flex items-center justify-center sticky top-0 z-10 bg-background mb-4">
        <span>New Group(4)</span>
        <Button variant="ghost" size="icon" className="absolute right-4">
          <SettingsIcon className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 space-y-4 px-4 mb-4">
      </div>
      <div className="absolute bottom-0 w-full h-16 border-t z-10 bg-background flex items-center">
        <div className="w-full flex justify-center">
          <Button className="rounded-full bg-red-500 hover:bg-red-600 shadow w-10 h-10" size="icon">
            <MicIcon className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};
