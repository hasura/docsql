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

  const stream = new ReadableStream({
    start(controller) {
      let planContent = "";
      let codeContent = "";
      let messageContent = "";
      let currentStep: string | null = null;
      let chunkCount = 0;
      let isStreamClosed = false;
      let abortController = new AbortController();

      const safeEnqueue = (data: string) => {
        if (!isStreamClosed && !abortController.signal.aborted) {
          try {
            controller.enqueue(data);
          } catch (error) {
            console.error("Failed to enqueue data:", error);
            isStreamClosed = true;
            abortController.abort();
          }
        }
      };

      const closeStream = () => {
        if (!isStreamClosed) {
          isStreamClosed = true;
          abortController.abort();
          try {
            controller.close();
          } catch (error) {
            // Stream already closed or in error state
            console.warn("Stream close warning:", error.message);
          }
        }
      };

      const handleError = (error: Error) => {
        if (abortController.signal.aborted) {
          return;
        }

        // Categorize error types
        let errorType = "unknown";
        let userMessage = "An unexpected error occurred. Please try again.";

        if (error.message.includes("fetch") || error.message.includes("ECONNREFUSED")) {
          errorType = "connection_failed";
          userMessage = "Unable to connect to the AI service. Please check your connection and try again.";
        } else if (error.message.includes("timeout")) {
          errorType = "timeout";
          userMessage = "Request timed out. Please try again with a shorter message.";
        } else if (error.message.includes("401") || error.message.includes("403")) {
          errorType = "authentication";
          userMessage = "Authentication failed. Please contact support.";
        } else if (error.message.includes("429")) {
          errorType = "rate_limit";
          userMessage = "Too many requests. Please wait a moment and try again.";
        }

        console.error({
          event: "chat_request_error",
          requestId,
          conversationId,
          errorType,
          error: error.message,
          stack: error.stack,
        });

        const errorData = JSON.stringify({
          success: false,
          error: userMessage,
          errorType,
          conversationId,
          timestamp: new Date(),
        });

        safeEnqueue(`data: ${errorData}\n\n`);
        closeStream();
      };

      // Store the promise so we can handle cancellation
      const queryPromise = client.queryStream(
        {
          artifacts: [],
          interactions,
        },
        async (chunk) => {
          if (isStreamClosed || abortController.signal.aborted) return;

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
              // Adding this to deal with punctuation and concatenating chunks
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

              safeEnqueue(`data: ${data}\n\n`);
            }
          }
        }
      );

      queryPromise
        .then(() => {
          if (!abortController.signal.aborted) {
            console.log({
              event: "chat_request_complete",
              requestId,
              conversationId,
              userMessage: message,
              completeResponse: messageContent,
              totalChunks: chunkCount,
              finalMessageLength: messageContent.length,
              duration: Date.now() - startTime,
            });
          }
          closeStream();
        })
        .catch(handleError);
    },

    cancel() {
      console.log({
        event: "chat_request_cancelled",
        requestId,
        conversationId,
      });
    },
  });

  return new Response(stream);
};
