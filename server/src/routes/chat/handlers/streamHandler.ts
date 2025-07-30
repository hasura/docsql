import type { Context } from "elysia";

export interface StreamState {
  planContent: string;
  codeContent: string;
  messageContent: string;
  currentStep: string | null;
  chunkCount: number;
  clientDisconnected: boolean;
}

export function createStreamHandler(conversationId: string, controller: ReadableStreamDefaultController<any>) {
  const state: StreamState = {
    planContent: "",
    codeContent: "",
    messageContent: "",
    currentStep: null,
    chunkCount: 0,
    clientDisconnected: false,
  };

  const safeEnqueue = (data: string) => {
    if (!state.clientDisconnected) {
      try {
        controller.enqueue(data);
      } catch (error) {
        if (error && typeof error === "object" && "code" in error && (error as any).code === "ERR_INVALID_STATE") {
          console.log("Client disconnected, continuing processing in background");
          state.clientDisconnected = true;
        } else {
          console.error("Failed to enqueue data:", error);
          throw error;
        }
      }
    }
  };

  const handleChunk = (chunk: any) => {
    if (chunk?.type !== "assistant_action_chunk") return;

    state.chunkCount++;
    let hasUpdate = false;

    if (chunk.plan) {
      state.planContent += chunk.plan;
      state.currentStep = "plan";
      hasUpdate = true;
    }

    if (chunk.code) {
      state.codeContent += chunk.code;
      state.currentStep = "code";
      hasUpdate = true;
    }

    if (chunk.message) {
      if (state.messageContent && /[.!?]$/.test(state.messageContent.trim()) && !/^\s/.test(chunk.message)) {
        state.messageContent += " ";
      }
      state.messageContent += chunk.message;
      state.currentStep = "message";
      hasUpdate = true;
    }

    if (hasUpdate && !state.clientDisconnected) {
      const cleanMessage = state.messageContent
        .replace(/<artifact[^>]*\/>/g, "")
        .replace(/<artifact[^>]*>.*?<\/artifact>/gs, "");

      const data = JSON.stringify({
        success: true,
        conversationId,
        step: state.currentStep,
        plan: state.planContent,
        code: state.codeContent,
        message: cleanMessage,
        timestamp: new Date(),
      });

      safeEnqueue(`data: ${data}\n\n`);
    }
  };

  return { handleChunk, state };
}
