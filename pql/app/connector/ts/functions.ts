import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    "[REMOVED]",
});

export type EmbeddingResult = {
  values: number[];
};

/**
 *
 * @readonly
 */
export async function transformQueryIntoEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return {
      values: response.data[0].embedding,
    };
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
