export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
}

export interface ChatWidgetProps {
  serverUrl: string;
  theme?: "light" | "dark" | "auto";
  className?: string;
  placeholder?: string;
  title?: string;
}
