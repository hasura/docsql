# PromptQL Backend

The PromptQL configuration and AI agent setup for the docs bot.

## Architecture

- **AI Agent Configuration** (`globals/metadata/promptql-config.hml`) - System instructions and LLM settings
- **Data Connectors** (`app/connector/`) - PostgreSQL for docs storage, TypeScript for embeddings and custom business
  logic
- **Metadata** (`app/metadata/`) - Supergraph schema and type definitions

## Key Components

### System Instructions

The bot is configured as "DocsBot" with specific behavior patterns:

- Lead with direct answers
- Minimum viable responses
- No marketing language
- Always provide user-facing messages before actions

### Data Layer

- **PostgreSQL**: Stores documentation chunks and chat history
- **TypeScript Connector**: Handles embedding generation and similarity search
- **Hasura DDN**: Provides the unified data API

## Development

Start PromptQL services:

```sh
ddn run docker-start
```

This starts:

- Query engine on port `3280`
- All configured connectors
- OpenTelemetry collector for observability

## Configuration

Environment variables in `.env`:

- `ANTHROPIC_KEY` - Claude API key
- `APP_PG_*` - PostgreSQL connection details
- `HASURA_DDN_PAT` - DDN access token

See [PromptQL documentation](https://promptql.io/docs/) for detailed configuration options.
