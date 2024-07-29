import { MicIcon, SettingsIcon, SquareIcon } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
} from "@renderer/components/ui";
import { t } from "i18next";
import {
  AppSettingsProviderContext,
  ChatProviderContext,
} from "@renderer/context";
import { useContext, useEffect, useState } from "react";
import { ChatForm } from "./chat-form";
import { useMicVAD } from "@ricky0123/vad-react";

export const Chat = () => {
  const { currentChat, chatAgents, updateChat, destroyChat } =
    useContext(ChatProviderContext);
  const [displayChatForm, setDisplayChatForm] = useState(false);
  const { EnjoyApp } = useContext(AppSettingsProviderContext);

  const askForMediaAccess = () => {
    EnjoyApp.system.preferences.mediaAccess("microphone");
  };

  const vad = useMicVAD({
    workletURL: "./vad.worklet.bundle.min.js", // setting workletURL
    modelURL: "./silero_vad.onnx", // setting modelURL
    startOnLoad: false,
    onSpeechEnd: (audio) => {
      console.log("Speech end detected");
      // do something with `audio` (Float32Array of audio samples at sample rate 16000)...
      const audioArray = new Float32Array(audio); // Example audio data
      vad.pause();
      return audioArray;
    },
  });

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-muted-foreground">{t("noChatSelected")}</span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen relative pb-16">
      <div className="h-12 border-b px-4 shadow flex items-center justify-center sticky top-0 z-10 bg-background mb-4">
        <span>
          {currentChat.name}({currentChat.members.length + 1})
        </span>
        <Dialog open={displayChatForm} onOpenChange={setDisplayChatForm}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute right-4">
              <SettingsIcon className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-md h-5/6">
            <DialogTitle className="sr-only"></DialogTitle>
            <ChatForm
              chat={currentChat}
              chatAgents={chatAgents}
              onSave={(data) =>
                updateChat(currentChat.id, data).then(() =>
                  setDisplayChatForm(false)
                )
              }
              onDestroy={() =>
                destroyChat(currentChat.id).then(() =>
                  setDisplayChatForm(false)
                )
              }
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 space-y-4 px-4 mb-4"></div>
      <div className="absolute bottom-0 w-full h-16 border-t z-10 bg-background flex items-center">
        <div className="w-full flex justify-center">
          {vad.listening ? (
            <Button
              onClick={() => vad.pause()}
              className="rounded-full bg-red-500 hover:bg-red-600 shadow w-10 h-10"
              size="icon"
            >
              <SquareIcon fill="white" className="w-6 h-6 text-white" />
            </Button>
          ) : (
            <Button
              onClick={() => vad.start()}
              className="rounded-full bg-red-500 hover:bg-red-600 shadow w-10 h-10"
              size="icon"
            >
              <MicIcon className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
