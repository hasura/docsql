import { Elysia } from "elysia";
import { sendMessage } from "./sendMessage";
import { getConversationState } from "./getConversationState";

export const chatRoutes = new Elysia({ prefix: "/chat" })
  .options("/conversations/:conversationId/messages", ({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = "*";
    set.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    return "";
  })
  .options("/conversations/:conversationId/state", ({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = "*";
    set.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    return "";
  })
  .get("/conversations/:conversationId/state", (context) => {
    context.set.headers["Access-Control-Allow-Origin"] = "*";
    return getConversationState(context);
  })
  .post("/conversations/:conversationId/messages", ({ set, ...context }) => {
    set.headers["Access-Control-Allow-Origin"] = "*";
    return sendMessage({ set, ...context });
  });
