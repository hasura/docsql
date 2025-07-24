import { Conversation, Message } from "../types";

export const generateConversationId = (): string => {
  return crypto.randomUUID();
};

export const generateMessageId = (): string => {
  return crypto.randomUUID();
};

export const createMessage = (role: "user" | "assistant", content: string, streaming = false): Message => ({
  id: generateMessageId(),
  role,
  content,
  timestamp: new Date(),
  streaming,
});

export const createConversation = (): Conversation => ({
  id: generateConversationId(),
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});
