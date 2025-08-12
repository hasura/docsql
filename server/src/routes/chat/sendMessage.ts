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

const generateToken = async () => {
  const jwt = await import("jsonwebtoken");

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 365 * 24 * 60 * 60,
    "claims.jwt.hasura.io": {
      "x-hasura-default-role": "public",
      "x-hasura-allowed-roles": ["public"],
    },
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || "");
  return token;
};

export const sendMessage = async ({ body, params, set, request }: Context) => {
  let parsedBody = body;
  if (!parsedBody && request) {
    try {
      parsedBody = await request.json();
    } catch (e) {
      console.log("Failed to parse JSON:", e);
    }
  }

  const { conversationId } = params;

  if (!parsedBody) {
    set.status = 400;
    return { error: "Request body is required" };
  }

  const { message, history } = parsedBody as {
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

    const token = await generateToken();
    const client = createPromptQLClientV2({
      apiKey: process.env.PQL_API_KEY || "",
      ddn: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const stream = new ReadableStream({
      start(controller) {
        const { handleChunk, state } = createStreamHandler(conversationId, controller);

        const queryPromise = client.queryStream({ artifacts: [], interactions }, handleChunk);

        queryPromise
          .then(() => {
            // Update global store with final state
            if ((global as any).conversationStore) {
              (global as any).conversationStore.set(conversationId, {
                messageContent: state.messageContent
                  .replace(/<artifact[^>]*\/>/g, "")
                  .replace(/<artifact[^>]*>.*?<\/artifact>/gs, ""),
                isComplete: true,
                timestamp: new Date(),
              });
            }

            // Send completion signal
            const completionData = JSON.stringify({
              success: true,
              conversationId,
              done: true,
              timestamp: new Date(),
            });

            try {
              controller.enqueue(`data: ${completionData}\n\n`);
            } catch {}

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
