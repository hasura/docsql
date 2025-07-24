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

      client
        .queryStream(
          {
            artifacts: [],
            interactions,
          },
          async (chunk) => {
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
                messageContent += chunk.message;
                currentStep = "message";
                hasUpdate = true;
              }

              if (hasUpdate) {
                const data = JSON.stringify({
                  success: true,
                  conversationId,
                  step: currentStep,
                  plan: planContent,
                  code: codeContent,
                  message: messageContent,
                  timestamp: new Date(),
                });

                controller.enqueue(`data: ${data}\n\n`);
              }
            }
          }
        )
        .then(() => {
          controller.close();
        });
    },
  });

  return new Response(stream);
};
