import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { Message } from "../types";
import styles from "./ChatMessages.module.css";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  theme?: "light" | "dark" | "auto";
  brandColor?: string;
}

export function ChatMessages({ messages, isLoading, theme, brandColor }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  if (messages.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.messages}>
          <div className={styles.empty}>Start a conversation by typing a message below</div>
        </div>
        <div className={styles.disclaimer}>DocsBot can make mistakes. Please verify important information.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.messages} ref={messagesContainerRef} onScroll={handleScroll}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} theme={theme} brandColor={brandColor} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.disclaimer}>DocsBot can make mistakes. Please verify important information.</div>
    </div>
  );
}
