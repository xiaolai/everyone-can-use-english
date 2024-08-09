import { createContext, useContext, useEffect, useState } from "react";
import { useChatSession, useTranscribe } from "@renderer/hooks";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { AppSettingsProviderContext } from "@renderer/context";
import { toast } from "@renderer/components/ui";
import { t } from "i18next";

type ChatSessionProviderState = {
  chatSessions: ChatSessionType[];
  currentSession: ChatSessionType;
  createChatSession: (params: any) => Promise<ChatSessionType>;
  updateChatMessage: (id: string, data: any) => Promise<ChatMessageType>;
  sessionSubmitting: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  togglePauseResume: () => void;
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  mediaRecorder: MediaRecorder;
};

const initialState: ChatSessionProviderState = {
  chatSessions: [],
  currentSession: null,
  createChatSession: () => null,
  updateChatMessage: () => null,
  sessionSubmitting: false,
  startRecording: () => null,
  stopRecording: () => null,
  togglePauseResume: () => null,
  isRecording: false,
  isPaused: false,
  recordingTime: 0,
  mediaRecorder: null,
};

export const ChatSessionProviderContext =
  createContext<ChatSessionProviderState>(initialState);

export const ChatSessionProvider = ({
  children,
  chat,
}: {
  children: React.ReactNode;
  chat: ChatType;
}) => {
  const { EnjoyApp } = useContext(AppSettingsProviderContext);
  const { transcribe } = useTranscribe();
  const {
    chatSessions,
    currentSession,
    createChatSession,
    updateChatMessage,
    submitting: sessionSubmitting,
  } = useChatSession(chat);

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

  const askForMediaAccess = () => {
    EnjoyApp.system.preferences.mediaAccess("microphone").then((access) => {
      if (!access) {
        toast.warning(t("noMicrophoneAccess"));
      }
    });
  };

  const onRecorded = async (blob: Blob) => {
    try {
      const { transcript, url } = await transcribe(blob, {
        language: chat.language,
        service: chat.config.sttEngine,
        align: false,
      });

      if (currentSession && currentSession.state === "pending") {
        const message = currentSession.messages[0];
        await updateChatMessage(message.id, {
          content: transcript,
          recordingUrl: url,
        });
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

  useEffect(() => {
    askForMediaAccess();
  }, []);

  useEffect(() => {
    if (!recordingBlob) return;

    onRecorded(recordingBlob);
  }, [recordingBlob]);

  useEffect(() => {
    if (!isRecording) return;

    if (recordingTime >= 60) {
      stopRecording();
    }
  }, [recordingTime]);

  return (
    <ChatSessionProviderContext.Provider
      value={{
        chatSessions,
        currentSession,
        createChatSession,
        updateChatMessage,
        sessionSubmitting,
        startRecording,
        stopRecording,
        togglePauseResume,
        isRecording,
        isPaused,
        recordingTime,
        mediaRecorder,
      }}
    >
      {children}
    </ChatSessionProviderContext.Provider>
  );
};
