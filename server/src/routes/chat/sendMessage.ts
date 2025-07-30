import type { Context } from "elysia";
import { createPromptQLClientV2 } from "@hasura/promptql";

const client = createPromptQLClientV2({
  apiKey: process.env.PQL_API_KEY || "",
});

export const sendMessage = async ({ body, params, set }: Context) => {
  const { conversationId } = params;
  const { message, history } = body as {
    message: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  // Set up cleanup tracking
  const cleanup = {
    completed: false,
    abortController: new AbortController(),
    timeoutId: null as NodeJS.Timeout | null,
  };

  // Auto-timeout after 5 minutes
  cleanup.timeoutId = setTimeout(() => {
    if (!cleanup.completed) {
      console.log({
        event: "chat_request_timeout",
        requestId,
        conversationId,
        duration: Date.now() - startTime,
      });
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

  // Handle client disconnect
  const clientDisconnected = new Promise<void>((resolve) => {
    const checkConnection = () => {
      if (cleanup.abortController.signal.aborted) {
        resolve();
      } else {
        setTimeout(checkConnection, 1000);
      }
    };
    checkConnection();
  });

  try {
    console.log({
      event: "chat_request_start",
      requestId,
      conversationId,
      messageLength: message.length,
      historyLength: history?.length || 0,
      timestamp: new Date().toISOString(),
    });

    set.headers["Content-Type"] = "text/event-stream";
    set.headers["Cache-Control"] = "no-cache";
    set.headers["Connection"] = "keep-alive";
    set.headers["Access-Control-Allow-Origin"] = "*";
    set.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type";

    // Store conversation state for reconnection
    const conversationState = {
      requestId,
      conversationId,
      messageContent: "",
      isComplete: false,
      timestamp: Date.now(),
    };

    // Validate conversationId exists
    if (!conversationId) {
      set.status = 400;
      return { error: "conversationId is required" };
    }

    // Validate conversationId exists
    if (!conversationId) {
      set.status = 400;
      return { error: "conversationId is required" };
    }

    // Update global conversation store
    global.conversationStore = global.conversationStore || new Map();
    global.conversationStore.set(conversationId, conversationState);

    // Build interactions from history + current message
    const interactions: Array<{
      user_message: { text: string };
      assistant_actions?: Array<{ message: string }>;
    }> = [];

    if (history) {
      for (let i = 0; i < history.length; i += 2) {
        const userMsg = history[i];
        const assistantMsg = history[i + 1];

        if (userMsg?.role === "user") {
          interactions.push({
            user_message: { text: userMsg.content },
            ...(assistantMsg?.role === "assistant" && {
              assistant_actions: [{ message: assistantMsg.content }],
            }),
          });
        }
      }
    }

    interactions.push({
      user_message: { text: message },
    });

    let isStreamClosed = false;
    let abortController = new AbortController();

    const stream = new ReadableStream({
      start(controller) {
        let planContent = "";
        let codeContent = "";
        let messageContent = "";
        let currentStep: string | null = null;
        let chunkCount = 0;
        let clientDisconnected = false;

        const safeEnqueue = (data: string) => {
          if (!isStreamClosed && !clientDisconnected) {
            try {
              controller.enqueue(data);
            } catch (error) {
              if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                (error as any).code === "ERR_INVALID_STATE"
              ) {
                // Client disconnected - continue processing in background
                console.log("Client disconnected, continuing processing in background");
                clientDisconnected = true;
              } else {
                console.error("Failed to enqueue data:", error);
                isStreamClosed = true;
                abortController.abort();
              }
            }
          }
        };

        const queryPromise = client.queryStream(
          { artifacts: [], interactions },
          async (chunk) => {
            // Don't abort on client disconnect - let it finish
            if (isStreamClosed && !clientDisconnected) {
              return;
            }

            chunkCount++;

            if (chunk?.type === "assistant_action_chunk") {
              let hasUpdate = false;

              if (chunk.plan) {
                planContent += chunk.plan;
                currentStep = "plan";
                hasUpdate = true;
              }

              if (chunk.code) {
                codeContent += chunk.code;
                currentStep = "code";
                hasUpdate = true;
              }

              if (chunk.message) {
                if (messageContent && /[.!?]$/.test(messageContent.trim()) && !/^\s/.test(chunk.message)) {
                  messageContent += " ";
                }
                messageContent += chunk.message;
                currentStep = "message";
                hasUpdate = true;
              }

              if (hasUpdate) {
                const cleanMessage = messageContent
                  .replace(/<artifact[^>]*\/>/g, "")
                  .replace(/<artifact[^>]*>.*?<\/artifact>/gs, "");

                const data = JSON.stringify({
                  success: true,
                  conversationId,
                  step: currentStep,
                  plan: planContent,
                  code: codeContent,
                  message: cleanMessage,
                  timestamp: new Date(),
                });

                // Only try to send to client if still connected
                if (!clientDisconnected) {
                  safeEnqueue(`data: ${data}\n\n`);
                }
              }
            }
          }
          // Don't pass abort signal - let PromptQL finish
        );

        queryPromise
          .then(() => {
            console.log({
              event: "chat_request_complete",
              requestId,
              conversationId,
              userMessage: message,
              completeResponse: messageContent,
              totalChunks: chunkCount,
              finalMessageLength: messageContent.length,
              duration: Date.now() - startTime,
              backgroundProcessing: clientDisconnected,
            });

            // TODO: Store final response in database/cache here
            // await storeConversationMessage(conversationId, messageContent);
          })
          .catch((error) => {
            console.error({
              event: "chat_request_error",
              requestId,
              error: error.message,
            });
          })
          .finally(() => {
            try {
              controller.close();
            } catch {}
          });
      },

      cancel() {
        console.log({
          event: "chat_request_cancelled",
          requestId,
          conversationId,
          reason: "client_disconnect",
        });
        // Don't call safeCleanup() - let PromptQL finish
      },
    });

    return new Response(stream);
  } catch (error) {
    safeCleanup();
    throw error;
  }
};
