import { useCallback } from "react";

interface StateRecoveryProps {
  serverUrl: string;
  conversationId: string;
  onStateRecovered: (content: string) => void;
}

export function useStateRecovery({ serverUrl, conversationId, onStateRecovered }: StateRecoveryProps) {
  const recoverState = useCallback(async () => {
    try {
      const response = await fetch(`${serverUrl}/chat/conversations/${conversationId}/state`);
      if (response.ok) {
        const state = await response.json();
        if (state.success && state.messageContent) {
          onStateRecovered(state.messageContent);
          return true;
        }
      }
    } catch (error) {
      console.error("State recovery failed:", error);
    }
    return false;
  }, [serverUrl, conversationId, onStateRecovered]);

  return { recoverState };
}
