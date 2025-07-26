import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "../types";
import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  message: Message;
  theme?: "light" | "dark" | "auto";
}

export function ChatMessage({ message, theme = "auto" }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Add this debug log
  console.log("ChatMessage theme:", theme);

  // Determine syntax highlighter theme
  const getHighlighterTheme = () => {
    if (theme === "dark") return oneDark;
    if (theme === "light") return oneLight;
    // Auto theme - check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? oneDark : oneLight;
  };

  // Add this debug log too
  console.log("Selected highlighter theme:", getHighlighterTheme() === oneDark ? "oneDark" : "oneLight");

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
                    const language = match ? match[1] : "";

                    return !inline ? (
                      <SyntaxHighlighter
                        style={getHighlighterTheme()}
                        language={language || "text"}
                        PreTag="div"
                        className={styles.codeBlock}
                        customStyle={{
                          margin: "8px 0",
                          borderRadius: "6px",
                          fontSize: "13px",
                          lineHeight: "1.4",
                          // Remove any background override here
                        }}
                        {...props}>
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
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
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
