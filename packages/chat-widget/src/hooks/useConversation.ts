import React, { useReducer, useCallback } from "react";
import { Conversation, Message } from "../types";
import { useLocalStorage } from "./useLocalStorage";

type ConversationAction =
  | { type: "ADD_MESSAGE"; message: Omit<Message, "id" | "timestamp"> }
  | { type: "UPDATE_LAST_MESSAGE"; content: string; streaming?: boolean }
  | { type: "CLEAR_CONVERSATION" };

function conversationReducer(state: Conversation, action: ConversationAction): Conversation {
  switch (action.type) {
    case "ADD_MESSAGE": {
      const newMessage: Message = {
        ...action.message,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        messages: [...state.messages, newMessage],
      };
    }
    case "UPDATE_LAST_MESSAGE": {
      const messages = [...state.messages];
      const lastMessage = messages[messages.length - 1];

      if (lastMessage && lastMessage.role === "assistant") {
        messages[messages.length - 1] = {
          ...lastMessage,
          content: action.content,
          streaming: action.streaming,
        };
      } else {
        const newAssistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: action.content,
          timestamp: new Date().toISOString(),
          streaming: action.streaming,
        };
        messages.push(newAssistantMessage);
      }

      return { ...state, messages };
    }
    case "CLEAR_CONVERSATION":
      return {
        id: crypto.randomUUID(),
        messages: [],
        createdAt: new Date().toISOString(),
      };
    default:
      return state;
  }
}

export function useConversation() {
  const [storedConversation, setStoredConversation] = useLocalStorage<Conversation>("pql-chat-conversation", {
    id: crypto.randomUUID(),
    messages: [],
    createdAt: new Date().toISOString(),
  });

  const [conversation, dispatch] = useReducer(conversationReducer, storedConversation);

  // Sync with localStorage whenever conversation changes
  React.useEffect(() => {
    console.log("Syncing conversation to localStorage:", conversation);
    setStoredConversation(conversation);
  }, [conversation, setStoredConversation]);

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    dispatch({ type: "ADD_MESSAGE", message });
  }, []);

  const updateLastMessage = useCallback((content: string, streaming = true) => {
    dispatch({ type: "UPDATE_LAST_MESSAGE", content, streaming });
  }, []);

  const clearConversation = useCallback(() => {
    dispatch({ type: "CLEAR_CONVERSATION" });
  }, []);

  return {
    conversation,
    isLoading: false,
    setIsLoading: () => {},
    addMessage,
    updateLastMessage,
    clearConversation,
  };
}
