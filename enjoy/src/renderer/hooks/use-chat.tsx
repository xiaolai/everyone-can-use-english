import { useEffect, useContext, useState, useReducer } from "react";
import {
  DbProviderContext,
  AppSettingsProviderContext,
} from "@renderer/context";
import { toast } from "@renderer/components/ui";
import { t } from "i18next";
import { chatsReducer } from "@renderer/reducers";

export const useChat = () => {
  const { EnjoyApp } = useContext(AppSettingsProviderContext);
  const { addDblistener, removeDbListener } = useContext(DbProviderContext);
  const [chats, dispatchChats] = useReducer(chatsReducer, []);

  const fetchChats = async (query?: string) => {
    EnjoyApp.chats
      .findAll({ query })
      .then((data) => {
        dispatchChats({ type: "set", records: data });
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const createChat = (data: {
    name: string;
    language: string;
    topic: string;
    members: Array<{
      userId: string;
      userType: string;
    }>;
  }) => {
    return EnjoyApp.chats
      .create(data)
      .then(() => {
        toast.success(t("models.chats.created"));
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const updateChat = (
    id: string,
    data: {
      name: string;
      language: string;
      topic: string;
      members: Array<{
        userId: string;
        userType: string;
      }>;
    }
  ) => {
    return EnjoyApp.chats
      .update(id, data)
      .then(() => {
        toast.success(t("models.chats.updated"));
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const destroyChat = (id: string) => {
    return EnjoyApp.chats
      .destroy(id)
      .then(() => {
        toast.success(t("models.chats.deleted"));
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const onChatAgentUpdate = (event: CustomEvent) => {
    const { model, action, record } = event.detail || {};
    if (model !== "ChatAgent") return;
    switch (action) {
      case "create": {
        dispatchChats({ type: "prepend", record });
        break;
      }
      case "update": {
        dispatchChats({ type: "update", record });
        break;
      }
      case "destroy": {
        dispatchChats({ type: "remove", record });
        break;
      }
    }
  };

  useEffect(() => {
    fetchChats();
    addDblistener(onChatAgentUpdate);

    () => {
      removeDbListener(onChatAgentUpdate);
    };
  }, []);

  return {
    chats,
    fetchChats,
    createChat,
    updateChat,
    destroyChat,
  };
};
