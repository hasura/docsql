# pql-docs-bot

> A PromptQL-specific implementation of a docs bot.

<img width="1999" height="1374" alt="image" src="https://github.com/user-attachments/assets/26fb3b43-5ffd-46ec-b828-495c791bb7d3" />

## What's Inside

This repository demonstrates a complete PromptQL-powered chat bot for documentation sites:

- **PromptQL Backend** ([`pql/`](pql/README.md)) - AI agent configuration and data connectors
- **API Server** ([`server/`](server/README.md)) - Elysia/Bun proxy server with streaming chat endpoints
- **Database Layer** ([`db/`](db/README.md)) - PostgreSQL with pgvector for document embeddings

## Quick Start

**Prerequisites**: [Docker](https://docs.docker.com/get-docker/),
[DDN CLI](https://promptql.io/docs/reference/cli/installation/), and [Bun](https://bun.sh/docs/installation)

### 1. Clone and setup environment files

```sh
git clone https://github.com/hasura/pql-docs-bot.git
cd pql-docs-bot
cp server/.env.template server/.env
cp pql/.env.template pql/.env
cp db/.env.template db/.env
```

### 2. Configure environment variables

Add environment variable values from 1Password (Product ACT vault). Edit `server/.env`, `pql/.env`, and `db/.env` with
actual values.

### 3. Set up database with embeddings

```sh
cd db && bun install
```

```sh
bun run db:up && sleep 5
```

```sh
bun run db:migrate
```

### 4. Generate seed data

This step requires `OPENAI_API_KEY` in `db/.env` and _only_ needs to be run if you want to update the data:

```sh
# Clone promptql-docs repo at the same level as this repo
git clone https://github.com/hasura/promptql-docs.git
```

```sh
# Which will generate a migration file with the embeddings using the docs from the promptql-docs repo
bun run db:generate-seed-migration ../promptql-docs/docs
```

### 5. Start services

The database should already be running from step 3.

Start the API server:

```sh
cd ../server && docker compose up -d
```

Start the PromptQL services:

```sh
cd ../pql && ddn run docker-start
```

Your docs bot is now running at `http://localhost:4000`, connected to your locally-running PromptQL backend, which is
connected to your local database.

## Database Management

The database layer uses PostgreSQL with pgvector for semantic search:

- **Migrations**: Schema and extension setup in `db/migrations/`
- **Seeding**: Automated embedding generation from markdown docs
- **Production**: Static SQL migrations with pre-computed embeddings

See [`db/README.md`](db/README.md) for detailed database operations.

## CI/CD

This project includes automated testing and quality checks:

- **Pre-commit hooks**: Automatically run server tests when server files are modified
- **GitHub Actions**: Run tests and Docker integration on pull requests
- **Husky**: Manages git hooks for consistent development workflow

To set up pre-commit hooks locally:

```sh
# In project root
bun install
```

Tests will automatically run when committing changes to the `server/` directory.
