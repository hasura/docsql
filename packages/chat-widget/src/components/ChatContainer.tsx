import React, { useCallback } from "react";
import toast from "react-hot-toast";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Conversation, Message } from "../types";
import { useConversation } from "../hooks/useConversation";
import { useStreamingChat } from "../hooks/useStreamingChat";
import { useStateRecovery } from "../hooks/useStateRecovery";
import { useConnectionMonitor } from "../hooks/useConnectionMonitor";
import styles from "./ChatContainer.module.css";

interface ChatContainerProps {
  serverUrl: string;
  placeholder: string;
  title: string;
  conversation: Conversation;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateLastMessage: (content: string, streaming?: boolean) => void;
  clearConversation: () => void;
  theme?: "light" | "dark" | "auto";
  brandColor?: string;
}

export function ChatContainer({
  serverUrl,
  placeholder,
  title,
  conversation,
  isLoading,
  setIsLoading,
  addMessage,
  updateLastMessage,
  clearConversation,
  theme,
  brandColor,
}: ChatContainerProps) {
  const handleMessage = (message: any) => {
    console.log("handleMessage called with:", message);
    if (message.role === "user") {
      console.log("Adding user message");
      addMessage(message);
    } else if (message.role === "assistant") {
      console.log("Handling assistant message, streaming:", message.streaming);
      // Only update if we're streaming, otherwise add new message
      if (message.streaming) {
        updateLastMessage(message.content, message.streaming);
      } else {
        // Final message - ensure it's marked as not streaming
        updateLastMessage(message.content, false);
      }
    }
  };

  const handleError = (error: string) => {
    console.error("Chat error:", error);
    toast.error(`Chat error: ${error}`);
  };

  const { sendMessage } = useStreamingChat({
    serverUrl,
    conversationId: conversation.id,
    onMessage: handleMessage,
    onError: handleError,
    setIsLoading,
  });

  const { recoverState } = useStateRecovery({
    serverUrl,
    conversationId: conversation.id,
    onStateRecovered: (content) => {
      updateLastMessage(content, false);
    },
  });

  const handleReconnect = useCallback(async () => {
    if (isLoading) {
      const recovered = await recoverState();
      if (recovered) {
        setIsLoading(false);
      }
    }
  }, [isLoading, recoverState, setIsLoading]);

  useConnectionMonitor(handleReconnect);

  const handleSendMessage = async (content: string) => {
    // Add user message immediately
    addMessage({
      role: "user",
      content,
      streaming: false,
    });

    // Use setTimeout to ensure the first message is processed before adding the second
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: "",
        streaming: true,
      });
    }, 0);

    const history = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    sendMessage(content, history);
  };

  return (
    <div className={styles.container}>
      <ChatMessages messages={conversation.messages} isLoading={isLoading} theme={theme} brandColor={brandColor} />
      <ChatInput placeholder={placeholder} onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
