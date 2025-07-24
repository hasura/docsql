import React from "react";
import styles from "./ChatHeader.module.css";

interface ChatHeaderProps {
  title: string;
  onNewChat: () => void;
}

export function ChatHeader({ title, onNewChat }: ChatHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <button onClick={onNewChat} className={styles.newButton}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        New
      </button>
    </div>
  );
}
