import { describe, it, expect, beforeEach } from "bun:test";
import { createStreamHandler } from "./streamHandler";

describe("Stream Handler", () => {
  let mockController: any;
  let enqueueData: string[];

  beforeEach(() => {
    enqueueData = [];
    mockController = {
      enqueue: (data: string) => enqueueData.push(data),
    };
  });

  it("should add space after sentence-ending punctuation", () => {
    const { handleChunk } = createStreamHandler("test-conv", mockController);

    handleChunk({ type: "assistant_action_chunk", message: "Hello world." });
    handleChunk({ type: "assistant_action_chunk", message: "Next sentence." });

    expect(enqueueData.length).toBe(2);
    const lastData = JSON.parse(enqueueData[1]!.replace("data: ", ""));
    expect(lastData.message).toBe("Hello world. Next sentence.");
  });

  it("should not add space after URLs ending with punctuation", () => {
    const { handleChunk } = createStreamHandler("test-conv", mockController);

    handleChunk({ type: "assistant_action_chunk", message: "Check https://example." });
    handleChunk({ type: "assistant_action_chunk", message: "com. More text here." });

    expect(enqueueData.length).toBe(2);
    const lastData = JSON.parse(enqueueData[1]!.replace("data: ", ""));
    expect(lastData.message).toBe("Check https://example.com. More text here.");
  });

  it("should not add space when next chunk starts with whitespace", () => {
    const { handleChunk } = createStreamHandler("test-conv", mockController);

    handleChunk({ type: "assistant_action_chunk", message: "Hello world." });
    handleChunk({ type: "assistant_action_chunk", message: " Next sentence." });

    expect(enqueueData.length).toBe(2);
    const lastData = JSON.parse(enqueueData[1]!.replace("data: ", ""));
    expect(lastData.message).toBe("Hello world. Next sentence.");
  });

  it("should handle HTTPS URLs correctly", () => {
    const { handleChunk } = createStreamHandler("test-conv", mockController);

    handleChunk({ type: "assistant_action_chunk", message: "Visit https://secure.example.com!" });
    handleChunk({ type: "assistant_action_chunk", message: "Great site." });

    expect(enqueueData.length).toBe(2);
    const lastData = JSON.parse(enqueueData[1]!.replace("data: ", ""));
    expect(lastData.message).toBe("Visit https://secure.example.com!Great site.");
  });
});
