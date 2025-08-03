import { Pool } from "pg";
import { writeFileSync } from "fs";
import { seedFromLocalDocs } from "./seed.ts";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function generateSeedMigration() {
  console.log("Generating seed data...");

  // First, seed the database
  await seedFromLocalDocs(process.argv[2] || "../promptql-docs/docs");

  console.log("Exporting seed data as migration...");

  // Export as INSERT statements
  const result = await pool.query(`
    SELECT 'INSERT INTO pql-bot.doc_content (id, page_url, title, description, keywords, content, is_checked, created_at, updated_at) VALUES (' ||
           quote_literal(id::text) || ', ' ||
           quote_literal(page_url) || ', ' ||
           quote_literal(title) || ', ' ||
           quote_literal(description) || ', ' ||
           quote_literal(keywords::text) || ', ' ||
           quote_literal(content) || ', ' ||
           is_checked || ', ' ||
           quote_literal(created_at::text) || ', ' ||
           quote_literal(updated_at::text) || ');' as sql
    FROM pql-bot.doc_content
    UNION ALL
    SELECT 'INSERT INTO pql-bot.doc_chunk (id, doc_content_id_fk, chunk_content, page_title, page_url, chunk_line_start, chunk_line_end, embedding, created_at, updated_at) VALUES (' ||
           quote_literal(id::text) || ', ' ||
           quote_literal(doc_content_id_fk::text) || ', ' ||
           quote_literal(chunk_content) || ', ' ||
           quote_literal(page_title) || ', ' ||
           quote_literal(page_url) || ', ' ||
           chunk_line_start || ', ' ||
           COALESCE(chunk_line_end::text, 'NULL') || ', ' ||
           quote_literal(embedding::text) || ', ' ||
           quote_literal(created_at::text) || ', ' ||
           quote_literal(updated_at::text) || ');'
    FROM pql-bot.doc_chunk
  `);

  const migration = result.rows.map((row) => row.sql).join("\n");
  writeFileSync("./migrations/002_seed_data.sql", migration);

  console.log("Migration generated: migrations/002_seed_data.sql");
  await pool.end();
}

generateSeedMigration().catch(console.error);
