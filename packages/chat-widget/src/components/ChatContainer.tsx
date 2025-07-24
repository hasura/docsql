import React from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useConversation } from "../hooks/useConversation";
import { useStreamingChat } from "../hooks/useStreamingChat";
import styles from "./ChatContainer.module.css";

interface ChatContainerProps {
  serverUrl: string;
  placeholder: string;
  title: string;
}

export function ChatContainer({ serverUrl, placeholder, title }: ChatContainerProps) {
  const { conversation, isLoading, setIsLoading, addMessage, updateLastMessage, clearConversation } = useConversation();

  const handleMessage = (message: any) => {
    if (message.role === "user") {
      addMessage(message);
    } else {
      // For assistant messages, always use updateLastMessage
      updateLastMessage(message.content, message.streaming);
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

  const handleSendMessage = (content: string) => {
    const history = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    sendMessage(content, history);
  };

  return (
    <div className={styles.container}>
      <ChatMessages messages={conversation.messages} />
      <ChatInput placeholder={placeholder} onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
