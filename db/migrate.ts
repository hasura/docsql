import { Pool } from "pg";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigrations() {
  console.log("Running database migrations...");

  const migrationFiles = readdirSync("./migrations")
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const sql = readFileSync(join("./migrations", file), "utf8");
    await pool.query(sql);
    console.log(`✓ ${file} completed`);
  }

  console.log("All migrations completed!");
  await pool.end();
}

runMigrations().catch(console.error);
