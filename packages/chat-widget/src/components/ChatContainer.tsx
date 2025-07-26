import React from "react";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useConversation } from "../hooks/useConversation";
import { useStreamingChat } from "../hooks/useStreamingChat";
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
    // Could show error toast here
  };

  const { sendMessage } = useStreamingChat({
    serverUrl,
    conversationId: conversation.id,
    onMessage: handleMessage,
    onError: handleError,
    setIsLoading,
  });

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
      <ChatMessages messages={conversation.messages} isLoading={isLoading} theme={theme} />
      <ChatInput placeholder={placeholder} onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
