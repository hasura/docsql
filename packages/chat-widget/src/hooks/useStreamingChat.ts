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
    async (content: string, history: Array<{ role: string; content: string }>, retryCount = 0) => {
      const maxRetries = 3;
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff

      setIsLoading(true);

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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        let assistantContent = "";
        let lastSuccessfulChunk = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.success === false) {
                  onError(data.error || "An error occurred");
                  return;
                }

                if (data.message) {
                  assistantContent = data.message;
                  lastSuccessfulChunk = data.message;
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
        console.error(`Stream error (attempt ${retryCount + 1}):`, error);

        if (retryCount < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          setTimeout(() => {
            sendMessage(content, history, retryCount + 1);
          }, retryDelay);
          return;
        }

        onError(error instanceof Error ? error.message : "Connection failed after retries");
        onMessage({
          role: "assistant",
          content: "",
          streaming: false,
        });
      } finally {
        if (retryCount === 0) {
          // Only reset loading on final attempt
          setIsLoading(false);
        }
      }
    },
    [serverUrl, conversationId, onMessage, onError, setIsLoading]
  );

  return { sendMessage };
}
