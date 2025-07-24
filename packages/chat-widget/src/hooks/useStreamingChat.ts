import { useCallback } from "react";

interface UseStreamingChatProps {
  serverUrl: string;
  conversationId: string;
  onMessage: (message: any) => void;
  onError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export function useStreamingChat({
  serverUrl,
  conversationId,
  onMessage,
  onError,
  setIsLoading,
}: UseStreamingChatProps) {
  const sendMessage = useCallback(
    async (content: string, history: Array<{ role: string; content: string }>) => {
      setIsLoading(true);

      try {
        // Add user message immediately
        onMessage({
          role: "user",
          content,
          streaming: false,
        });

        onMessage({
          role: "assistant",
          content: "...",
          streaming: true,
        });

        const response = await fetch(`${serverUrl}/chat/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content,
            history,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        let assistantContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log("Received streaming data:", data);

                // Only show the final message, ignore plan/code
                if (data.message) {
                  assistantContent = data.message;
                  onMessage({
                    role: "assistant",
                    content: assistantContent,
                    streaming: true,
                  });
                }
              } catch (e) {
                console.error("JSON parse error for line:", line, e);
              }
            }
          }
        }

        // Final message without streaming flag
        onMessage({
          role: "assistant",
          content: assistantContent,
          streaming: false,
        });
      } catch (error) {
        onError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    [serverUrl, conversationId, onMessage, onError, setIsLoading]
  );

  return { sendMessage };
}
