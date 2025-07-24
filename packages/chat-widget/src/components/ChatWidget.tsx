import React from "react";
import { ChatContainer } from "./ChatContainer";
import { ChatWidgetProps } from "../types";
import styles from "./ChatWidget.module.css";

export function ChatWidget({
  serverUrl,
  theme = "auto",
  className,
  placeholder = "Ask a question...",
  title = "Documentation Chat",
}: ChatWidgetProps) {
  return (
    <div className={`${styles.widget} ${styles[theme]} ${className || ""}`} data-theme={theme}>
      <ChatContainer serverUrl={serverUrl} placeholder={placeholder} title={title} />
    </div>
  );
}
