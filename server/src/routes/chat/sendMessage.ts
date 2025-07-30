import type { Context } from "elysia";
import { createPromptQLClientV2 } from "@hasura/promptql";
import { createStreamHandler } from "./handlers/streamHandler";
import { initializeConversationState, buildInteractions } from "./handlers/conversationManager";
import {
  logRequestStart,
  logRequestComplete,
  logRequestError,
  logRequestCancelled,
  logRequestTimeout,
} from "./handlers/requestLogger";

const client = createPromptQLClientV2({
  apiKey: process.env.PQL_API_KEY || "",
});

export const sendMessage = async ({ body, params, set }: Context) => {
  const { conversationId } = params;
  const { message, history } = body as {
    message: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!conversationId) {
    set.status = 400;
    return { error: "conversationId is required" };
  }

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  // Set up cleanup tracking
  const cleanup = {
    completed: false,
    abortController: new AbortController(),
    timeoutId: null as NodeJS.Timeout | null,
  };

  cleanup.timeoutId = setTimeout(() => {
    if (!cleanup.completed) {
      logRequestTimeout(requestId, conversationId, startTime);
      cleanup.abortController.abort();
    }
  }, 5 * 60 * 1000);

  const safeCleanup = () => {
    if (!cleanup.completed) {
      cleanup.completed = true;
      cleanup.abortController.abort();
      if (cleanup.timeoutId) {
        clearTimeout(cleanup.timeoutId);
      }
    }
  };

  try {
    logRequestStart(requestId, conversationId, message, history);

    set.headers["Content-Type"] = "text/event-stream";
    set.headers["Cache-Control"] = "no-cache";
    set.headers["Connection"] = "keep-alive";
    set.headers["Access-Control-Allow-Origin"] = "*";
    set.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type";

    initializeConversationState(requestId, conversationId);
    const interactions = buildInteractions(history, message);

    const stream = new ReadableStream({
      start(controller) {
        const { handleChunk, state } = createStreamHandler(conversationId, controller);

        const queryPromise = client.queryStream({ artifacts: [], interactions }, handleChunk);

        queryPromise
          .then(() => {
            logRequestComplete(
              requestId,
              conversationId,
              message,
              state.messageContent,
              state.chunkCount,
              startTime,
              state.clientDisconnected
            );
          })
          .catch((error) => {
            logRequestError(requestId, error);
          })
          .finally(() => {
            try {
              controller.close();
            } catch {}
          });
      },

      cancel() {
        logRequestCancelled(requestId, conversationId);
      },
    });

    return new Response(stream);
  } catch (error) {
    safeCleanup();
    throw error;
  }
};
