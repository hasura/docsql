import OpenAI from "openai";
import { Pool } from "pg";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "[REMOVED]",
});

const pool = new Pool({
  connectionString: process.env.PG_DATABASE_URL,
});

export type EmbeddingResult = {
  values: number[];
};

export type DocOperationResult = {
  success: boolean;
  docContentId?: string;
  message: string;
};

interface DocPage {
  pageUrl: string;
  title: string;
  description?: string;
  keywords?: string[];
  content: string;
}

interface DocChunk {
  content: string;
  lineStart: number;
  lineEnd: number;
}

/**
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

/**
 * @readonly
 */
export async function insertNewPage(page: DocPage): Promise<DocOperationResult> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const contentResult = await client.query(
      `INSERT INTO pql_docs.doc_content (page_url, title, description, keywords, content, is_checked)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
      [page.pageUrl, page.title, page.description, page.keywords, page.content]
    );

    const docContentId = contentResult.rows[0].id;
    await generateChunksAndEmbeddings(client, docContentId, page);

    await client.query("COMMIT");
    return {
      success: true,
      docContentId,
      message: `Successfully inserted page: ${page.pageUrl}`,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    return {
      success: false,
      message: `Failed to insert page: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  } finally {
    client.release();
  }
}

/**
 * @readonly
 */
export async function updateExistingPage(page: DocPage): Promise<DocOperationResult> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const contentResult = await client.query(
      `UPDATE pql_docs.doc_content 
       SET title = $2, description = $3, keywords = $4, content = $5, updated_at = NOW()
       WHERE page_url = $1 RETURNING id`,
      [page.pageUrl, page.title, page.description, page.keywords, page.content]
    );

    if (contentResult.rows.length === 0) {
      return {
        success: false,
        message: `Page not found: ${page.pageUrl}`,
      };
    }

    const docContentId = contentResult.rows[0].id;

    await client.query("DELETE FROM pql_docs.doc_chunk WHERE doc_content_id_fk = $1", [docContentId]);

    await generateChunksAndEmbeddings(client, docContentId, page);

    await client.query("COMMIT");
    return {
      success: true,
      docContentId,
      message: `Successfully updated page: ${page.pageUrl}`,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    return {
      success: false,
      message: `Failed to update page: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  } finally {
    client.release();
  }
}

/**
 * @readonly
 */
export async function deletePage(pageUrl: string): Promise<DocOperationResult> {
  const client = await pool.connect();
  try {
    const result = await client.query("DELETE FROM pql_docs.doc_content WHERE page_url = $1", [pageUrl]);

    if (result.rowCount === 0) {
      return {
        success: false,
        message: `Page not found: ${pageUrl}`,
      };
    }

    return {
      success: true,
      message: `Successfully deleted page: ${pageUrl}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete page: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  } finally {
    client.release();
  }
}

async function generateChunksAndEmbeddings(client: any, docContentId: string, page: DocPage): Promise<void> {
  const chunks = chunkContent(page.content, 500);

  for (const chunk of chunks) {
    const embedding = await transformQueryIntoEmbedding(chunk.content);

    await client.query(
      `INSERT INTO pql_docs.doc_chunk 
       (doc_content_id_fk, chunk_content, page_title, page_url, page_description, 
        chunk_line_start, chunk_line_end, embedding)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        docContentId,
        chunk.content,
        page.title,
        page.pageUrl,
        page.description,
        chunk.lineStart,
        chunk.lineEnd,
        `[${embedding.values.join(",")}]`,
      ]
    );
  }
}

function chunkContent(content: string, chunkSize: number): DocChunk[] {
  const chunks: DocChunk[] = [];
  const lines = content.split("\n");
  let currentChunk = "";
  let lineStart = 0;
  let currentLine = 0;

  for (const line of lines) {
    if (currentChunk.length + line.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        lineStart,
        lineEnd: currentLine - 1,
      });
      currentChunk = line + "\n";
      lineStart = currentLine;
    } else {
      currentChunk += line + "\n";
    }
    currentLine++;
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      lineStart,
      lineEnd: currentLine - 1,
    });
  }

  return chunks;
}
