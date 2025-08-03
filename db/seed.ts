import fs from "fs";
import path from "path";
import matter from "gray-matter";
import OpenAI from "openai";
import { Pool } from "pg";

// Configuration
const DOCS_BASE_URL = "https://promptql.io/docs";
const CHUNK_SIZE = 500;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function seedFromLocalDocs(docsPath: string) {
  console.log(`Seeding from local docs: ${docsPath}`);

  const files = getAllMdxFiles(docsPath);
  console.log(`Found ${files.length} documentation files`);

  for (const file of files) {
    await processDocFile(file, docsPath);
  }

  console.log("Seeding complete!");
  await pool.end();
}

async function processDocFile(filePath: string, docsRoot: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter, content: body } = matter(content);

  // Convert file path to URL
  const relativePath = path.relative(docsRoot, filePath);
  const pageUrl = `${DOCS_BASE_URL}/${relativePath.replace(/\.mdx?$/, "").replace(/\\/g, "/")}`;

  console.log(`Processing: ${pageUrl}`);

  // Insert doc_content
  const contentResult = await pool.query(
    `
    INSERT INTO pql-bot.doc_content (page_url, title, description, keywords, content, is_checked)
    VALUES ($1, $2, $3, $4, $5, true) RETURNING id
  `,
    [
      pageUrl,
      frontmatter.title || path.basename(filePath, path.extname(filePath)),
      frontmatter.description || null,
      frontmatter.keywords || null,
      body,
    ]
  );

  const docContentId = contentResult.rows[0].id;

  // Chunk and embed
  const chunks = chunkContent(body, CHUNK_SIZE);
  console.log(`  Creating ${chunks.length} chunks...`);

  for (const [index, chunk] of chunks.entries()) {
    const embedding = await generateEmbedding(chunk);

    await pool.query(
      `
      INSERT INTO pql-bot.doc_chunk (doc_content_id_fk, chunk_content, page_title, page_url, chunk_line_start, embedding)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [docContentId, chunk, frontmatter.title, pageUrl, index * CHUNK_SIZE, `[${embedding.join(",")}]`]
    );
  }
}

function getAllMdxFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath));
    } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function chunkContent(content: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// CLI usage when run directly
if (import.meta.main) {
  const docsPath = process.argv[2];
  if (!docsPath) {
    console.error("Usage: bun run seed.ts <path-to-docs-directory>");
    process.exit(1);
  }

  seedFromLocalDocs(docsPath).catch(console.error);
}
