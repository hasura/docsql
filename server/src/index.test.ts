import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";

const app = new Elysia().get("/", () => "PromptQL Chat Proxy");

describe("Server root endpoint", () => {
  it("should return welcome message", async () => {
    const response = await app.handle(new Request("http://localhost/"));
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("PromptQL Chat Proxy");
  });
});
