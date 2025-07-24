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
├── .dev.sh
├── README.md
├── compose.yaml
└── ngrok.yml
```

## Development

The `.dev.sh` file provides a configuration for starting up all necessary services using a
[tmux](https://github.com/tmux/tmux/wiki) session; it's configured for [Neovim](https://neovim.io/) and
[ngrok](https://ngrok.com/) as well.

These services are **not required** for starting the development environment or contributing to the project. However,
they make life easier! Below, choose your own adventure to get started 👇

### Use the `.dev.sh` script

#### Step 1. Install Prerequisites

Before advancing, ensure you've installed the following:

- [tmux](https://github.com/tmux/tmux/wiki)
- [DDN CLI](https://promptql.io/docs/reference/cli/installation/)
- [Bun](https://bun.sh/docs/installation)
- [Docker](https://docs.docker.com/get-docker/)
- [Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim)
- [ngrok](https://ngrok.com/download)

Create a `.env` in the root of the project:

```sh
touch .env
```

Then, fill it with the key-values found [here](#).

Finally, from the root of the repository, run the development script:

```sh
chmod +x ./.dev.sh && ./.dev.sh
```

Your terminal will be taken over by four panes:

- **Neovim**: for development.
- **Docker**: Logs for the `pql-bot` service.
- **Docker**: Logs for all PromptQL-related services (i.e., the distributed query engine, playground, and any
  connectors).
- **ngrok**: Logs for the server proxy.

### Start services manually

You'll need:

- [Docker](https://docs.docker.com/get-docker/)
- [DDN CLI](https://promptql.io/docs/reference/cli/installation/)

From the root of the project, run the compose file for the server in detached mode:

```sh
docker compose up -d
```

Then, bring up the PromptQL-related services:

```sh
cd pql && ddn run docker-start
```

You can utilize ngrok as a proxy as you see fit.

## Contributing

Coming soon!

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
