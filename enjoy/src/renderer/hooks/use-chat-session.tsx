import { useEffect, useContext, useReducer, useState } from "react";
import {
  DbProviderContext,
  AppSettingsProviderContext,
} from "@renderer/context";
import { toast } from "@renderer/components/ui";
import { t } from "i18next";
import { chatSessionsReducer, chatsReducer } from "@renderer/reducers";
import { useTranscribe } from "@renderer/hooks";

export const useChatSession = (chat: ChatType) => {
  const { EnjoyApp, user } = useContext(AppSettingsProviderContext);
  const { addDblistener, removeDbListener } = useContext(DbProviderContext);
  const [chatSessions, dispatchChatSessions] = useReducer(
    chatSessionsReducer,
    []
  );
  const [submitting, setSubmitting] = useState(false);
  const { transcribe } = useTranscribe();

  const currentSession = chatSessions.length
    ? chatSessions[chatSessions.length - 1]
    : null;

  const fetchChatSessions = async (chatId: string) => {
    EnjoyApp.chatSessions.findAll({ where: { chatId } }).then((data) => {
      dispatchChatSessions({ type: "set", records: data });
    });
  };

  const createChatSession = async (params: {
    transcript: string;
    recordingUrl: string;
  }) => {
    const { transcript, recordingUrl } = params;
    if (!transcript || !recordingUrl) return;

    setSubmitting(true);
    const member = chat.members.find(
      (member) => member.userId === user.id.toString()
    );

    return EnjoyApp.chatSessions
      .create({
        chatId: chat.id,
        chatMessage: {
          memberId: member.id,
          content: transcript,
        },
        url: recordingUrl,
      })
      .finally(() => setSubmitting(false));
  };

  const updateChatMessage = async (
    id: string,
    data: { content: string; recordingUrl: string }
  ) => {
    const { content, recordingUrl } = data;
    if (!content || !recordingUrl) return;

    setSubmitting(true);
    return EnjoyApp.chatMessages
      .update(id, { content, url: recordingUrl })
      .finally(() => setSubmitting(false));
  };

  const onChatSessionUpdate = (event: CustomEvent) => {
    const { model, action, record } = event.detail;
    if (model === "ChatSession") {
      switch (action) {
        case "create":
          dispatchChatSessions({ type: "append", record });
          break;
        case "update":
          dispatchChatSessions({ type: "update", record });
          break;
        case "destroy":
          dispatchChatSessions({ type: "remove", record });
          break;
      }
    } else if (model === "ChatMessage") {
      switch (action) {
        case "create":
          dispatchChatSessions({ type: "addMessage", message: record });
          break;
        case "update":
          dispatchChatSessions({ type: "updateMessage", message: record });
          break;
        case "destroy":
          dispatchChatSessions({ type: "removeMessage", message: record });
          break;
      }
    }
  };

  useEffect(() => {
    if (!chat) return;

    fetchChatSessions(chat.id);
    addDblistener(onChatSessionUpdate);

    return () => {
      removeDbListener(onChatSessionUpdate);
    };
  }, [chat?.id]);

  return {
    chatSessions,
    currentSession,
    createChatSession,
    updateChatMessage,
    submitting,
  };
};
