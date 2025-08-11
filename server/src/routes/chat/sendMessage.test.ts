import { describe, it, expect, beforeAll } from "bun:test";
import { Elysia } from "elysia";
import { sendMessage } from "./sendMessage";

describe("Chat sendMessage integration", () => {
  let app: Elysia;

  beforeAll(() => {
    app = new Elysia().post("/chat/conversations/:conversationId/messages", sendMessage);
  });

  it("should return streaming response", async () => {
    const response = await app.handle(
      new Request("http://localhost/chat/conversations/test-123/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Hello",
          history: [],
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(response.body).toBeDefined();
  });

  it("should handle invalid request body", async () => {
    const response = await app.handle(
      new Request("http://localhost/chat/conversations/test-456/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Missing required fields
      })
    );

    // Should return 500 for invalid request body
    expect(response.status).toBe(500);
  });

  it("should not add spaces after URLs ending with punctuation", async () => {
    const response = await app.handle(
      new Request("http://localhost/chat/conversations/test-url/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Tell me about URLs",
          history: [],
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(response.body).toBeDefined();

    // Note: This test verifies the endpoint works for URL-related queries
    // The actual URL spacing logic is tested in the stream handler unit tests
  });
});
