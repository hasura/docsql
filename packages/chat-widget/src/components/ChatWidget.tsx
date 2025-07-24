import React, { useState } from "react";
import { ChatContainer } from "./ChatContainer";
import { ChatWidgetProps } from "../types";
import { useConversation } from "../hooks/useConversation";
import styles from "./ChatWidget.module.css";

export function ChatWidget({
  serverUrl,
  theme = "auto",
  className,
  placeholder = "Ask a question...",
  title = "Documentation Chat",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const conversationState = useConversation();
  const { conversation, isLoading, setIsLoading, addMessage, updateLastMessage, clearConversation } = conversationState;

  return (
    <>
      {/* Floating Button */}
      <button
        className={`${styles.floatingButton} ${styles[theme]}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div
            className={`${styles.modal} ${styles[theme]} ${className || ""}`}
            onClick={(e) => e.stopPropagation()}
            data-theme={theme}>
            <div className={styles.modalHeader}>
              <h3>{title}</h3>
              <div className={styles.headerButtons}>
                <button
                  className={styles.newButton}
                  onClick={conversationState.clearConversation}
                  aria-label="New conversation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  New
                </button>
                <button className={styles.closeButton} onClick={() => setIsOpen(false)} aria-label="Close chat">
                  ×
                </button>
              </div>
            </div>
            <div className={styles.modalContent}>
              <ChatContainer
                serverUrl={serverUrl}
                placeholder={placeholder}
                title={title}
                conversation={conversation}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                addMessage={addMessage}
                updateLastMessage={updateLastMessage}
                clearConversation={clearConversation}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
