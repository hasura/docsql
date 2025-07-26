import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";

describe("Health check", () => {
  it("should respond to health check", async () => {
    const app = new Elysia().get("/", () => "PromptQL Chat Proxy");

    const response = await app.handle(new Request("http://localhost/"));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("PromptQL Chat Proxy");
  });
});
