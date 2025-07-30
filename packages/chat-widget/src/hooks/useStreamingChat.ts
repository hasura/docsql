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

      // Set a timeout to reset loading state if no response
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        onError("Request timed out");
      }, 120000); // 2 minutes

      try {
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

        clearTimeout(timeoutId);

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

                // Handle error responses
                if (data.success === false) {
                  onError(data.error || "An error occurred");
                  return;
                }

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
        clearTimeout(timeoutId);
        onError(error instanceof Error ? error.message : "Unknown error");

        // Add a final empty assistant message to clear the streaming state
        onMessage({
          role: "assistant",
          content: "",
          streaming: false,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [serverUrl, conversationId, onMessage, onError, setIsLoading]
  );

  return { sendMessage };
}
