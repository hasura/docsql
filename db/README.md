# Database Layer

PostgreSQL database with pgvector extension for document embeddings and semantic search.

## Architecture

- **PostgreSQL + pgvector**: Vector similarity search for documentation chunks
- **Embedding Generation**: OpenAI text-embedding-3-small model
- **Migration System**: SQL-based schema and data migrations
- **Chunking Strategy**: 500-character chunks with overlap for context

## Quick Setup

```sh
# Install dependencies
bun install

# Copy and configure environment
cp .env.template .env

# Add your OPENAI_API_KEY to .env

# Start database
bun run db:up

# Run migrations
bun run db:migrate

# Generate embeddings and seed data
git clone https://github.com/hasura/promptql-docs.git
bun run db:generate-seed-migration ../promptql-docs/docs
```

## Database Schema

### `docs_bot.doc_content`

- Full documentation pages with metadata
- Stores title, description, keywords, and raw content
- Links to chunked embeddings via foreign key

### `docs_bot.doc_chunk`

- 500-character content chunks with embeddings
- 1536-dimensional vectors from OpenAI
- Includes page context and line positioning

## Available Scripts

```sh
# Database lifecycle
bun run db:up          # Start PostgreSQL container
bun run db:down        # Stop and remove container
bun run db:migrate     # Run all migration files
bun run db:reset       # Drop and recreate with migrations

# Data management
bun run db:seed <docs-path>                    # Seed from local docs
bun run db:generate-seed-migration <docs-path> # Create migration file
```

## Development Workflow

### Local Development

```sh
# Start fresh database
bun run db:down && bun run db:up
sleep 5 && bun run db:migrate

# Connect and explore
# JDBC: jdbc:postgresql://local.hasura.dev:5432/docs_bot?user=docs&password=password
psql postgresql://docs:password@local.hasura.dev:5432/docs_bot
```

### Production Deployment

The seeding process generates `migrations/002_seed_data.sql` with pre-computed embeddings, eliminating the need for
OpenAI API access in production environments.

## Environment Variables

Required in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - For embedding generation during seeding
- `DOCS_PATH` - Path to documentation source files
- `CHUNK_SIZE` - Character count per embedding chunk (default: 500)

## Troubleshooting

**Vector extension not found**: Ensure you're using the `pgvector/pgvector:pg16` image and the extension is created as
superuser.

**Embedding generation fails**: Verify your `OPENAI_API_KEY` is valid and has sufficient credits.

**Migration conflicts**: Use `bun run db:reset` to start with a clean slate.
