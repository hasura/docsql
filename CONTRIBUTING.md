# Contributing to pql-docs-bot

Thank you for your interest in contributing! This guide will help you set up a comprehensive development environment and
understand our development workflows.

## Enhanced Development Setup

For the best development experience, we provide a `.dev.sh` script that sets up a complete development environment using
tmux with multiple panes for different services.

### Prerequisites

Install the following tools:

- [tmux](https://github.com/tmux/tmux/wiki)
- [DDN CLI](https://promptql.io/docs/reference/cli/installation/)
- [Bun](https://bun.sh/docs/installation)
- [Docker](https://docs.docker.com/get-docker/)
- [Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim)
- [ngrok](https://ngrok.com/download)

### Setup

1. **Create environment files:**

   ```sh
   cp server/.env.template server/.env
   cp pql/.env.template pql/.env
   ```

   Fill them with the key-values from the **Product ACT** vault in 1Password (ask a team member for access if needed).

2. **Run the development script:**
   ```sh
   chmod +x ./.dev.sh && ./.dev.sh
   ```

### What You Get

Your terminal will be taken over by four tmux panes:

- **Neovim**: for development
- **Docker**: Logs for the `pql-bot` service
- **Docker**: Logs for all PromptQL-related services (i.e., the distributed query engine, playground, and any
  connectors)
- **ngrok**: Logs for the server proxy

This setup provides:

- ✅ Live code editing with Neovim
- ✅ Real-time service logs
- ✅ External access via ngrok tunneling
- ✅ Hot reloading for both server and PromptQL changes

## Manual Development Setup

If you prefer not to use the automated script:

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [DDN CLI](https://promptql.io/docs/reference/cli/installation/)

### Steps

1. **Start the server:**

   ```sh
   cd server && docker compose up -d
   ```

2. **Start PromptQL services:**

   ```sh
   cd pql && ddn run docker-start
   ```

3. **Optional - Set up ngrok proxy:**
   ```sh
   cd server && export $(grep -v '^#' .env | xargs) && ngrok start --config ngrok.yml --all
   ```

## Development Workflows

### Pre-commit Hooks

This project uses Husky for automated pre-commit testing:

- **Automatic setup**: Run `bun install` to install and configure hooks
- **Smart testing**: Tests only run when server files are modified
- **Fast feedback**: Prevents broken code from being committed

When you commit changes to the `server/` directory, tests will run automatically:

```sh
$ git commit -m "Update server endpoint"
Server files changed, running pre-commit hooks...
✓ All tests passed
```

### Making Changes

1. **PromptQL changes**: Edit files in the `pql/` directory
2. **Server changes**: Edit files in the `server/` directory - tests run automatically on commit
3. **Server supports hot reloading** when using the development setup

### Testing

**Server tests**:

```sh
cd server && bun test
```

## Project Structure

```plaintext
.
├── pql/                    # PromptQL configuration and metadata
│   ├── app/               # Application-specific connectors and metadata
│   ├── globals/           # Global PromptQL configuration
│   └── compose.yaml       # PromptQL services
├── server/                # Elysia/Bun server
│   ├── src/              # Server source code
│   ├── compose.yaml      # Server container definition
│   ├── ngrok.yml         # ngrok tunneling configuration
│   ├── .env              # Server environment variables
│   └── Dockerfile        # Server container definition
├── .github/workflows/     # CI/CD automation
├── .dev.sh               # Development environment script
└── compose.yaml          # Main docker-compose file
```

## Getting Help

- **PromptQL questions**: Check the [PromptQL documentation](https://promptql.io/docs/)
- **Project-specific issues**: Open an issue in this repository
- **Development setup problems**: Check the troubleshooting section below

## Troubleshooting

### Common Issues

**tmux session already exists:**

```sh
tmux kill-session -t bot-dev
./.dev.sh
```

**Port conflicts:**

- Check if services are already running: `docker ps`
- Stop conflicting services: `docker compose down`

**Environment variables not loading:**

- Ensure your `.env` file is in the project root
- Get the correct values from the **Product ACT** vault in 1Password
- Check that all required variables are set
- Restart the development environment

**PromptQL build failures:**

- Verify DDN CLI is authenticated: `ddn auth status`
- Check that all required environment variables are in `.env.cloud`
- Review build logs in the GitHub Actions tab
