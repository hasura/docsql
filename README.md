# pql-docs-bot

> A PromptQL-specific implementation of a docs bot.

<img width="1227" height="917" alt="image" src="https://github.com/user-attachments/assets/6aef4823-c145-4e51-9caf-21f556241491" />

## What's Inside

This repository demonstrates a complete PromptQL-powered chat bot for documentation sites:

- **PromptQL Backend** ([`pql/`](pql/README.md)) - AI agent configuration and data connectors
- **API Server** ([`server/`](server/README.md)) - Elysia/Bun proxy server with streaming chat endpoints
- **Database Layer** ([`db/`](db/README.md)) - PostgreSQL with pgvector for document embeddings

## Quick Start

**Prerequisites**: [Docker](https://docs.docker.com/get-docker/),
[DDN CLI](https://promptql.io/docs/reference/cli/installation/), and [Bun](https://bun.sh/docs/installation)

```sh
# 1. Clone and setup environment files
git clone https://github.com/hasura/pql-docs-bot.git
cd pql-docs-bot
cp server/.env.template server/.env
cp pql/.env.template pql/.env
cp db/.env.template db/.env

# 2. Add environment variable values from 1Password (Product ACT vault)
# Edit server/.env, pql/.env, and db/.env with actual values

# 3. Set up database with embeddings
cd db && bun install
bun run db:up && sleep 5
bun run db:migrate

# 4. Generate seed data (requires OPENAI_API_KEY in db/.env)
git clone https://github.com/hasura/promptql-docs.git
bun run db:generate-seed-migration ../promptql-docs/docs

# 5. Start services
cd ../server && docker compose up -d
cd ../pql && ddn run docker-start
```

Your docs bot is now running at `http://localhost:4000`

## Development

For enhanced development setup with tmux, hot reloading, and ngrok tunneling:

```sh
chmod +x ./.dev.sh && ./.dev.sh
```

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
bun install  # Installs husky
```

Tests will automatically run when committing changes to the `server/` directory.
