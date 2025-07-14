import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    "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",
});

/**
 *
 * @readonly
 */
export async function transformQueryIntoEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
