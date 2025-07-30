export function logRequestStart(
  requestId: string,
  conversationId: string,
  message: string,
  history?: Array<{ role: "user" | "assistant"; content: string }>
) {
  console.log({
    event: "chat_request_start",
    requestId,
    conversationId,
    messageLength: message.length,
    historyLength: history?.length || 0,
    timestamp: new Date().toISOString(),
  });
}

export function logRequestComplete(
  requestId: string,
  conversationId: string,
  message: string,
  messageContent: string,
  chunkCount: number,
  startTime: number,
  clientDisconnected: boolean
) {
  console.log({
    event: "chat_request_complete",
    requestId,
    conversationId,
    userMessage: message,
    completeResponse: messageContent,
    totalChunks: chunkCount,
    finalMessageLength: messageContent.length,
    duration: Date.now() - startTime,
    backgroundProcessing: clientDisconnected,
  });
}

export function logRequestError(requestId: string, error: any) {
  console.error({
    event: "chat_request_error",
    requestId,
    error: error.message,
  });
}

export function logRequestCancelled(requestId: string, conversationId: string) {
  console.log({
    event: "chat_request_cancelled",
    requestId,
    conversationId,
    reason: "client_disconnect",
  });
}

export function logRequestTimeout(requestId: string, conversationId: string, startTime: number) {
  console.log({
    event: "chat_request_timeout",
    requestId,
    conversationId,
    duration: Date.now() - startTime,
  });
}
