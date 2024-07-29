export const chatAgentsReducer = (
  chatAgents: ChatAgentType[],
  action: {
    type: "append" | "prepend" | "update" | "remove" | "set";
    record?: ChatAgentType;
    records?: ChatAgentType[];
  }
) => {
  switch (action.type) {
    case "append": {
      if (action.record) {
        return [...chatAgents, action.record];
      } else if (action.records) {
        return [...chatAgents, ...action.records];
      } else {
        return chatAgents;
      }
    }
    case "prepend": {
      return [action.record, ...chatAgents];
    }
    case "update": {
      return chatAgents.map((chatAgent) => {
        if (chatAgent.id === action.record.id) {
          return Object.assign(chatAgent, action.record);
        } else {
          return chatAgent;
        }
      });
    }
    case "remove": {
      return chatAgents.filter(
        (chatAgent) => chatAgent.id !== action.record.id
      );
    }
    case "set": {
      return action.records || [];
    }
    default: {
      throw Error(`Unknown action: ${action.type}`);
    }
  }
};
