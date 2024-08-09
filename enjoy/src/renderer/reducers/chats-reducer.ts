export const chatsReducer = (
  chats: ChatType[],
  action: {
    type: "append" | "prepend" | "update" | "remove" | "set";
    record?: ChatType;
    records?: ChatType[];
  }
) => {
  switch (action.type) {
    case "append": {
      if (action.record) {
        return [...chats, action.record];
      } else if (action.records) {
        return [...chats, ...action.records];
      } else {
        return chats;
      }
    }
    case "prepend": {
      return [action.record, ...chats];
    }
    case "update": {
      return chats.map((chat) => {
        if (chat.id === action.record.id) {
          return Object.assign(chat, action.record);
        } else {
          return chat;
        }
      });
    }
    case "remove": {
      return chats.filter((chat) => chat.id !== action.record.id);
    }
    case "set": {
      return action.records || [];
    }
    default: {
      throw Error(`Unknown action: ${action.type}`);
    }
  }
};
