import { Elysia } from "elysia";
import { sendMessage } from "./sendMessage";

export const chatRoutes = new Elysia({ prefix: "/chat" })
  .options("/conversations/:conversationId/messages", ({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = "*";
    set.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    return "";
  })
  .post("/conversations/:conversationId/messages", sendMessage);
