export interface ConversationState {
  requestId: string;
  conversationId: string;
  messageContent: string;
  isComplete: boolean;
  timestamp: number;
}

export function initializeConversationState(requestId: string, conversationId: string): ConversationState {
  const state: ConversationState = {
    requestId,
    conversationId,
    messageContent: "",
    isComplete: false,
    timestamp: Date.now(),
  };

  global.conversationStore = global.conversationStore || new Map();
  global.conversationStore.set(conversationId, state);

  return state;
}

export function buildInteractions(
  history: Array<{ role: "user" | "assistant"; content: string }> | undefined,
  message: string
) {
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

  return interactions;
}
