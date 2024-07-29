import { useEffect, useContext, useState, useReducer } from "react";
import {
  DbProviderContext,
  AppSettingsProviderContext,
} from "@renderer/context";
import { toast } from "@renderer/components/ui";
import { t } from "i18next";
import { chatAgentsReducer } from "@renderer/reducers";

export const useChatAgent = () => {
  const { EnjoyApp } = useContext(AppSettingsProviderContext);
  const { addDblistener, removeDbListener } = useContext(DbProviderContext);
  const [chatAgents, dispatchChatAgents] = useReducer(chatAgentsReducer, []);

  const fetchChatAgents = async (query?: string) => {
    EnjoyApp.chatAgents
      .findAll({ query })
      .then((data) => {
        dispatchChatAgents({ type: "set", records: data });
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const createChatAgent = (data: {
    name: string;
    language: string;
    introduction: string;
    config: any;
  }) => {
    return EnjoyApp.chatAgents
      .create(data)
      .then(() => {
        toast.success(t("models.chatAgents.created"));
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const updateChatAgent = (
    id: string,
    data: {
      name: string;
      language: string;
      introduction: string;
      config: any;
    }
  ) => {
    return EnjoyApp.chatAgents
      .update(id, data)
      .then(() => {
        toast.success(t("models.chatAgents.updated"));
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const destroyChatAgent = (id: string) => {
    return EnjoyApp.chatAgents
      .destroy(id)
      .then(() => {
        toast.success(t("models.chatAgents.deleted"));
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
        dispatchChatAgents({ type: "prepend", record });
        break;
      }
      case "update": {
        dispatchChatAgents({ type: "update", record });
        break;
      }
      case "destroy": {
        dispatchChatAgents({ type: "remove", record });
        break;
      }
    }
  };

  useEffect(() => {
    fetchChatAgents();
    addDblistener(onChatAgentUpdate);

    () => {
      removeDbListener(onChatAgentUpdate);
    };
  }, []);

  return {
    chatAgents,
    fetchChatAgents,
    createChatAgent,
    updateChatAgent,
    destroyChatAgent,
  };
};
