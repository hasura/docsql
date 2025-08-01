import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Message, ChatWidgetConfig, StreamingChunk } from "../types";

interface ChatWidgetContextType {
  // Configuration
  theme: "light" | "dark";
  brandColor: string;
  position: "bottom-right" | "bottom-left";
  placeholder: string;
  welcomeMessage: string;
  apiEndpoint: string;

  // State
  messages: Message[];
  isConnected: boolean;
  hasUnread: boolean;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => void;
  clearMessages: () => void;
}

const ChatWidgetContext = createContext<ChatWidgetContextType | undefined>(undefined);

interface ChatWidgetProviderProps {
  children: React.ReactNode;
  config: ChatWidgetConfig;
}

export const ChatWidgetProvider: React.FC<ChatWidgetProviderProps> = ({ children, config }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");

  // Initialize conversation ID
  useEffect(() => {
    const stored = localStorage.getItem("chat-widget-conversation-id");
    if (stored) {
      setConversationId(stored);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem("chat-widget-conversation-id", newId);
      setConversationId(newId);
    }
  }, []);

  // Test connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${config.apiEndpoint}/health`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        setIsConnected(response.ok);
      } catch (error) {
        console.error("Connection test failed:", error);
        setIsConnected(false);
      }
    };

    testConnection();
  }, [config.apiEndpoint]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!isConnected) {
        throw new Error("Not connected to chat service");
      }

      if (!conversationId) {
        throw new Error("No conversation ID available");
      }

      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
        streaming: false,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Create streaming assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        streaming: true,
        chunks: {},
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setHasUnread(true);

      try {
        console.log("Sending to:", `${config.apiEndpoint}/chat/conversations/${conversationId}/messages`);
        const response = await fetch(`${config.apiEndpoint}/chat/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content,
            history: [],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Failed to send message:", error);

        // Update message with error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: "Sorry, I encountered an error. Please try again.",
                  streaming: false,
                }
              : msg
          )
        );
      }
    },
    [isConnected, config.apiEndpoint]
  );

  const markAsRead = useCallback(() => {
    setHasUnread(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setHasUnread(false);
    const newId = crypto.randomUUID();
    localStorage.setItem("chat-widget-conversation-id", newId);
    setConversationId(newId);
  }, []);

  const contextValue: ChatWidgetContextType = {
    // Configuration
    theme: config.theme || "light",
    brandColor: config.brandColor || "#007acc",
    position: config.position || "bottom-right",
    placeholder: config.placeholder || "Type your message...",
    welcomeMessage: config.welcomeMessage || "Hi! How can I help you today?",
    apiEndpoint: config.apiEndpoint,

    // State
    messages,
    isConnected,
    hasUnread,

    // Actions
    sendMessage,
    markAsRead,
    clearMessages,
  };

  return <ChatWidgetContext.Provider value={contextValue}>{children}</ChatWidgetContext.Provider>;
};

export const useChatWidget = () => {
  const context = useContext(ChatWidgetContext);
  if (context === undefined) {
    throw new Error("useChatWidget must be used within a ChatWidgetProvider");
  }
  return context;
};
