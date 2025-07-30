import type { Context } from "elysia";

export const getConversationState = async ({ params }: Context) => {
  const { conversationId } = params;
  const state = (global as any).conversationStore?.get(conversationId);

  if (!state) {
    return { success: false, error: "No active conversation" };
  }

  return {
    success: true,
    conversationId,
    messageContent: state.messageContent,
    isComplete: state.isComplete,
    timestamp: state.timestamp,
  };
};
