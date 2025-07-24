# pql-docs-bot

> A PromptQL-specific implementation of a docs bot.

## Overview

This all-in-one repository has two purposes:

- Control development and deployment of our PromptQL-specific implementation of a chat bot for use in the PromptQL docs.
- Illustrate the architecture and workflows necessary to use a PromptQL-powered application in the real world.

You'll find the following structure, with the `pql` directory containing all PromptQL-related files and the `server`
directory containing an Elysia server, written with Bun and TypeScript, acting as a proxy and providing a backend API
which can be consumed by various frontends (e.g., a front-end chat component).

```plaintext
.
├── pql
├── server
├── packages/chat-widget
├── .dev.sh
├── README.md
├── compose.yaml
└── ngrok.yml
```

## Architecture

This repository contains:

- **PromptQL Backend** (`pql/`) - PromptQL configuration and metadata for the docs bot
- **API Server** (`server/`) - Elysia/Bun server providing chat endpoints
- **Chat Widget** (`packages/chat-widget/`) - Reusable React component for embedding chat functionality

### Chat Widget Package

The `@pql/chat-widget` is a standalone React component that can be embedded in any documentation site or application. It
provides:

- Floating chat button with modal interface
- Streaming message support
- Light/dark/auto theme modes
- TypeScript support
- Minimal dependencies

**Installation:**

```sh
npm install @pql/chat-widget
```

**Usage:**

```tsx
import { ChatWidget } from "@pql/chat-widget";
import "@pql/chat-widget/styles";

<ChatWidget serverUrl="http://localhost:3000" theme="auto" title="Documentation Chat" />;
```

## Quick Start

Get the project running with just the essentials:

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [DDN CLI](https://promptql.io/docs/reference/cli/installation/)

### Setup

1. **Clone and navigate to the project:**

   ```sh
   git clone https://github.com/hasura/pql-docs-bot.git
   cd pql-docs-bot
   ```

2. **Create environment files:**

   ```sh
   touch .env && cd pql && touch .env
   ```

   Fill them with the key-values from the **Product ACT** vault in 1Password (ask a team member for access if needed).

3. **Start the server:**

   ```sh
   cd server && docker compose up -d
   ```

4. **Start PromptQL services:**
   ```sh
   cd pql && ddn run docker-start
   ```

That's it! Your PromptQL docs bot is now running locally.

### Testing the Chat Widget

To test chat widget changes locally:

```sh
cd packages/chat-widget && bun run test
```

This starts a test application that demonstrates the widget functionality. Make sure the server is running first, then
open `http://localhost:3001` in your browser.

## Contributing

Want to contribute or set up a full development environment? Check out [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Enhanced development setup with tmux, Neovim, and ngrok
- Development workflows and coding standards
- Chat widget development using the included test app
- How to contribute back to the project

## CI/CD

This repository includes automated PromptQL build and deployment workflows:

### Build on Pull Request

When you open a PR with changes to the `pql/` directory:

- **Automatic build creation** using the DDN CLI
- **PR comment** with build version and PromptQL playground link
- **Comment updates** as you push new commits to the PR

### Deploy on Merge

When a PR merges to `main` with `pql/` changes:

- **Automatic build application** to production
- **Deployment confirmation** comment on the merged PR

### Setup

The workflows use 1Password for secure secret management. All secrets are stored in the **Product ACT** vault with the
service account token configured as `OP_SERVICE_ACCOUNT_TOKEN` in GitHub repository secrets.

See `.github/workflows/` for the complete workflow definitions.
