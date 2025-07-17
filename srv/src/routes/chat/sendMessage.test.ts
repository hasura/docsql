import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { sendMessage } from "./sendMessage";

interface MessageResponse {
  success: boolean;
  conversationId: string;
  message: {
    role: string;
    content: string;
    timestamp: Date;
  };
}

const app = new Elysia().post(
  "/chat/conversations/:conversationId/messages",
  sendMessage,
);

describe("sendMessage handler", () => {
  it("should handle message requests", async () => {
    const response = await app.handle(
      new Request(
        "http://localhost/chat/conversations/test-conv-123/messages",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Hello, how are you?" }),
        },
      ),
    );

    const json = (await response.json()) as MessageResponse;

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.conversationId).toBe("test-conv-123");
    expect(json.message.role).toBe("assistant");
    expect(json.message.content).toBe("Echo: Hello, how are you?");
  });

  it("should handle different conversation IDs", async () => {
    const response = await app.handle(
      new Request(
        "http://localhost/chat/conversations/another-conv-456/messages",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Testing" }),
        },
      ),
    );

    const json = (await response.json()) as MessageResponse;

    expect(json.conversationId).toBe("another-conv-456");
    expect(json.message.content).toBe("Echo: Testing");
  });
});
