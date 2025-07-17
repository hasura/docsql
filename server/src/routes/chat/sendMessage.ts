import type { Context } from "elysia";

export const sendMessage = async ({ body, params }: Context) => {
  const { conversationId } = params;
  const { message } = body as { message: string };

  // TODO: Forward to PromptQL API
  // TODO: Handle response from PromptQL
  // TODO: Store message in conversation

  return {
    success: true,
    conversationId,
    message: {
      role: "assistant",
      content: `Echo: ${message}`,
      timestamp: new Date(),
    },
  };
};
