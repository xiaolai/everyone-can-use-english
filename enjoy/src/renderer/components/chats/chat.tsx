import {
  LoaderIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
  SquareIcon,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  toast,
} from "@renderer/components/ui";
import { t } from "i18next";
import {
  AppSettingsProviderContext,
  ChatProviderContext,
} from "@renderer/context";
import { useContext, useEffect, useState } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { LiveAudioVisualizer } from "react-audio-visualize";
import { useTranscribe, useChatSession } from "@renderer/hooks";
import { ChatSession, ChatForm } from "@renderer/components";

export const Chat = () => {
  const { currentChat, chatAgents, updateChat, destroyChat } =
    useContext(ChatProviderContext);
  const [displayChatForm, setDisplayChatForm] = useState(false);
  const { EnjoyApp, user } = useContext(AppSettingsProviderContext);
  const { chatSessions, currentSession, createChatSession, submitting } =
    useChatSession(currentChat);

  const askForMediaAccess = () => {
    EnjoyApp.system.preferences.mediaAccess("microphone").then((access) => {
      if (!access) {
        toast.warning(t("noMicrophoneAccess"));
      }
    });
  };

  const { transcribe } = useTranscribe();

  const handleRecording = async (blob: Blob) => {
    try {
      const { transcript, url } = await transcribe(blob, {
        language: currentChat.language,
        service: currentChat.config.sttEngine,
        align: false,
      });

      if (currentSession && currentSession.state === "pending") {
      } else {
        await createChatSession({
          transcript,
          recordingUrl: url,
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder,
  } = useAudioRecorder();

  useEffect(() => {
    askForMediaAccess();
  }, []);

  useEffect(() => {
    if (!recordingBlob) return;
  }, [recordingBlob]);

  useEffect(() => {
    if (!isRecording) return;

    if (recordingTime >= 60) {
      stopRecording();
    }
  }, [recordingTime]);

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
          {currentChat.name}({currentChat.membersCount})
        </span>
        <Dialog open={displayChatForm} onOpenChange={setDisplayChatForm}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute right-4">
              <SettingsIcon className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-md h-5/6">
            <DialogTitle className="sr-only"></DialogTitle>
            <ScrollArea className="h-full px-4">
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
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 space-y-4 px-4 mb-4">
        {chatSessions.map((chatSession) => (
          <ChatSession key={chatSession.id} chatSession={chatSession} />
        ))}
      </div>
      <div className="absolute bottom-0 w-full h-16 border-t z-10 bg-background flex items-center">
        <div className="w-full flex justify-center">
          {submitting ? (
            <div>
              <LoaderIcon className="w-6 h-6 animate-spin" />
            </div>
          ) : isRecording ? (
            <div className="flex items-center space-x-2">
              <LiveAudioVisualizer
                mediaRecorder={mediaRecorder}
                barWidth={2}
                gap={2}
                width={140}
                height={30}
                fftSize={512}
                maxDecibels={-10}
                minDecibels={-80}
                smoothingTimeConstant={0.4}
              />
              <span className="text-sm text-muted-foreground">
                {Math.floor(recordingTime / 60)}:
                {String(recordingTime % 60).padStart(2, "0")}
              </span>
              <Button
                onClick={togglePauseResume}
                className="rounded-full shadow w-8 h-8"
                size="icon"
              >
                {isPaused ? (
                  <PlayIcon fill="white" className="w-4 h-4" />
                ) : (
                  <PauseIcon fill="white" className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={stopRecording}
                className="rounded-full bg-red-500 hover:bg-red-600 shadow w-8 h-8"
                size="icon"
              >
                <SquareIcon fill="white" className="w-4 h-4 text-white" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={startRecording}
              className="rounded-full shadow w-10 h-10"
              disabled={currentSession?.state === "pending"}
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
