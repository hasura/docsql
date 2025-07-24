import { useState, useCallback } from "react";
import { Conversation, Message } from "../types";

export function useConversation() {
  const [conversation, setConversation] = useState<Conversation>(() => ({
    id: crypto.randomUUID(),
    messages: [],
    createdAt: new Date(),
  }));

  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, []);

  const updateLastMessage = useCallback((content: string, streaming = true) => {
    setConversation((prev) => {
      const messages = [...prev.messages];
      const lastMessage = messages[messages.length - 1];

      if (lastMessage && lastMessage.role === "assistant") {
        messages[messages.length - 1] = {
          ...lastMessage,
          content,
          streaming,
        };
      } else {
        messages.push({
          id: crypto.randomUUID(),
          role: "assistant",
          content,
          timestamp: new Date(),
          streaming,
        });
      }

      return { ...prev, messages };
    });
  }, []);

  const clearConversation = useCallback(() => {
    setConversation({
      id: crypto.randomUUID(),
      messages: [],
      createdAt: new Date(),
    });
  }, []);

  return {
    conversation,
    isLoading,
    setIsLoading,
    addMessage,
    updateLastMessage,
    clearConversation,
  };
}
