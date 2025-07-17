import { Elysia } from "elysia";
import { sendMessage } from "./sendMessage";

export const chatRoutes = new Elysia({ prefix: "/chat" }).post(
  "/conversations/:conversationId/messages",
  sendMessage,
);
