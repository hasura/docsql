import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../types";
import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`${styles.message} ${styles[message.role]}`}>
      <div className={styles.avatar}>{isUser ? "U" : "A"}</div>
      <div className={styles.content}>
        <div className={styles.text} data-loading={message.content === "..." ? "true" : undefined}>
          {isUser ? (
            <>
              {message.content}
              {message.streaming && <span className={styles.cursor}>|</span>}
            </>
          ) : (
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline ? (
                      <pre className={styles.codeBlock}>
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className={styles.inlineCode} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
                  ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
                  ol: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
                  li: ({ children }) => <li className={styles.listItem}>{children}</li>,
                  strong: ({ children }) => <strong className={styles.bold}>{children}</strong>,
                }}>
                {message.content}
              </ReactMarkdown>
              {message.streaming && <span className={styles.cursor}>|</span>}
            </>
          )}
        </div>
        <div className={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
