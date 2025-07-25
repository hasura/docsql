# Chat API Server

Elysia/Bun server providing streaming chat endpoints for the PromptQL docs bot.

## Endpoints

- `GET /` - Health check
- `POST /chat/send` - Send message with streaming response

## Streaming Response Format

The server streams JSON chunks with the following structure:

```json
{
  "success": true,
  "conversationId": "uuid",
  "step": "plan|code|message",
  "plan": "...",
  "code": "...",
  "message": "...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Development

```sh
# Start with hot reloading (recommended)
docker compose up

# Or run directly with bun
bun install
bun --watch src/index.ts

# Run tests
bun test
```

## Production

```sh
# Build image
docker build -t docs-bot-server .
```

## Environment Variables

Required in `.env`:

- `SERVER_PORT` - Server port (default: 4000)
- `PQL_API_KEY` - PromptQL API key

## Integration

The server acts as a proxy between frontend clients and the PromptQL backend, handling:

- CORS for browser requests
- Streaming response formatting
- Error handling and logging
