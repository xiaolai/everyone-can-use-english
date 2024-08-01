export const chatSessionsReducer = (
  chatSessions: ChatSessionType[],
  action: {
    type:
      | "append"
      | "prepend"
      | "update"
      | "remove"
      | "set"
      | "addMessage"
      | "removeMessage"
      | "updateMessage";
    record?: ChatSessionType;
    records?: ChatSessionType[];
    message?: ChatMessageType;
  }
) => {
  switch (action.type) {
    case "append": {
      if (action.record) {
        return [...chatSessions, action.record];
      } else if (action.records) {
        return [...chatSessions, ...action.records];
      } else {
        return chatSessions;
      }
    }
    case "prepend": {
      return [action.record, ...chatSessions];
    }
    case "update": {
      return chatSessions.map((chatSession) => {
        if (chatSession.id === action.record.id) {
          return Object.assign(chatSession, action.record);
        } else {
          return chatSession;
        }
      });
    }
    case "remove": {
      return chatSessions.filter(
        (chatSession) => chatSession.id !== action.record.id
      );
    }
    case "set": {
      return action.records || [];
    }
    case "addMessage": {
      const chatSession = chatSessions.find(
        (chatSession) => chatSession.id === action.message.sessionId
      );
      if (chatSession) {
        if (!chatSession.messages) {
          chatSession.messages = [];
        }
        chatSession.messages.push(action.message);
        return chatSessions.map((session) =>
          session.id === chatSession.id ? chatSession : session
        );
      } else {
        return chatSessions;
      }
    }
    case "removeMessage": {
      const chatSession = chatSessions.find(
        (chatSession) => chatSession.id === action.message.sessionId
      );
      if (chatSession) {
        chatSession.messages = chatSession.messages.filter(
          (message) => message.id !== action.message.id
        );
        return chatSessions.map((session) =>
          session.id === chatSession.id ? chatSession : session
        );
      }
    }
    case "updateMessage": {
      const chatSession = chatSessions.find(
        (chatSession) => chatSession.id === action.message.sessionId
      );
      if (chatSession) {
        chatSession.messages = chatSession.messages.map((message) => {
          if (message.id === action.message.id) {
            return Object.assign(message, action.message);
          } else {
            return message;
          }
        });
        return chatSessions.map((session) =>
          session.id === chatSession.id ? chatSession : session
        );
      }
    }
    default: {
      throw Error(`Unknown action: ${action.type}`);
    }
  }
};
