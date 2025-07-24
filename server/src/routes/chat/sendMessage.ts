import type { Context } from "elysia";
import { createPromptQLClientV2 } from "@hasura/promptql";

const client = createPromptQLClientV2({
  apiKey: process.env.PQL_API_KEY || "",
});

export const sendMessage = async ({ body, params }: Context) => {
  const { conversationId } = params;
  const { message, history } = body as {
    message: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  try {
    let responseContent = "";

    // Build interactions from history + current message
    const interactions = [];

    // Add history as pairs (user message + assistant response)
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

    // Add current message
    interactions.push({
      user_message: { text: message },
    });

    await client.queryStream(
      {
        artifacts: [],
        interactions,
      },
      async (chunk) => {
        if (chunk && typeof chunk === "object" && "type" in chunk) {
          if (chunk.type === "assistant_action_chunk" && chunk.message) {
            responseContent += chunk.message;
          }
        } else if (typeof chunk === "string") {
          responseContent += chunk;
        }
      }
    );

    return {
      success: true,
      conversationId,
      message: {
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      },
    };
  } catch (error) {
    console.error("PromptQL API error:", error);
    return {
      success: false,
      error: "Failed to process message",
    };
  }
};
