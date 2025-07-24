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

1. **Create environment file:**

   ```sh
   touch .env
   ```

   Fill it with the key-values from the **Product ACT** vault in 1Password (ask a team member for access if needed).

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
   docker compose up -d
   ```

2. **Start PromptQL services:**

   ```sh
   cd pql && ddn run docker-start
   ```

3. **Optional - Set up ngrok proxy:**
   ```sh
   export $(grep -v '^#' .env | xargs) && ngrok start --config ngrok.yml --all
   ```

## Development Workflows

### Making Changes

1. **PromptQL changes**: Edit files in the `pql/` directory
2. **Server changes**: Edit files in the `server/` directory
3. **Both support hot reloading** when using the development setup

### Testing Your Changes

- **PromptQL**: Use the playground link from your PR build comments
- **Server**: Test API endpoints directly or through your frontend integration

### Submitting Changes

1. **Create a feature branch:**

   ```sh
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit them with descriptive messages

3. **Push and create a PR:**

   ```sh
   git push origin feature/your-feature-name
   ```

4. **Watch for automated build comments** on your PR with playground links for testing

## Project Structure

```plaintext
.
├── pql/                    # PromptQL configuration and metadata
│   ├── app/               # Application-specific connectors and metadata
│   ├── globals/           # Global PromptQL configuration
│   └── compose.yaml       # PromptQL services
├── server/                # Elysia/Bun server
│   ├── src/              # Server source code
│   └── Dockerfile        # Server container definition
├── .github/workflows/     # CI/CD automation
├── .dev.sh               # Development environment script
└── compose.yaml          # Main docker-compose file
```

## Coding Standards

### PromptQL

- Follow DDN CLI conventions for metadata organization
- Use descriptive names for connectors and data sources
- Document any custom functions or complex queries

### Server (TypeScript/Bun)

- Use TypeScript for type safety
- Follow existing code patterns and structure
- Add tests for new functionality

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
