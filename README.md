# pql-docs-bot

> A PromptQL-specific implementation of a docs bot.

## What's Inside

This repository demonstrates a complete PromptQL-powered chat bot for documentation sites:

- **PromptQL Backend** ([`pql/`](pql/README.md)) - AI agent configuration and data connectors
- **API Server** ([`server/`](server/README.md)) - Elysia/Bun proxy server with streaming chat endpoints
- **Chat Widget** ([`packages/chat-widget/`](packages/chat-widget/README.md)) - Embeddable React component for any site

## Quick Start

**Prerequisites**: [Docker](https://docs.docker.com/get-docker/) and
[DDN CLI](https://promptql.io/docs/reference/cli/installation/)

```sh
# 1. Clone and setup
git clone https://github.com/hasura/pql-docs-bot.git
cd pql-docs-bot
touch .env && cd pql && touch .env

# 2. Add environment variables from 1Password (Product ACT vault)

# 3. Start services
cd server && docker compose up -d
cd ../pql && ddn run docker-start
```

Your docs bot is now running at `http://localhost:4000`

## Development

For enhanced development setup with tmux, hot reloading, and ngrok tunneling:

```sh
chmod +x ./.dev.sh && ./.dev.sh
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development workflows.
