# DocsQL

> An AI-powered documentation assistant built with PromptQL

<img width="1999" height="1374" alt="image" src="https://github.com/user-attachments/assets/26fb3b43-5ffd-46ec-b828-495c791bb7d3" />

DocsQL is a smart documentation bot that helps developers find answers in technical documentation quickly and
accurately. Built as a demonstration of PromptQL's capabilities, it showcases how to create reliable AI agents that can
understand complex technical queries and provide precise, contextual responses.

## Why DocsQL?

Documentation is often vast and scattered. DocsQL solves this by:

- **Semantic Search**: Understanding intent, not just keywords
- **Contextual Responses**: Providing relevant code examples and explanations
- **Source Attribution**: Always linking back to original documentation
- **Real-time Updates**: Staying current with documentation changes
- **Built-in Validation**: Ensuring accuracy through automated verification

## Architecture

This project demonstrates a complete AI-powered documentation system:

- **PromptQL Backend** ([`pql/`](pql/README.md)) - AI agent with validation protocols and system instructions
- **Vector-enabled Database** ([`db/`](db/README.md)) - PostgreSQL with pgvector for semantic search
- **API Server** ([`server/`](server/README.md)) - Streaming chat interface built with Elysia/Bun

## Key Features

**Smart Query Understanding**: DocsQL doesn't just match keywords; it understands what you're trying to accomplish and
finds the most relevant documentation sections.

**Validation-First Responses**: Every technical answer is validated against the actual documentation before being
provided, ensuring accuracy.

**Streaming Responses**: Real-time response streaming provides immediate feedback while the AI processes complex
queries.

**Source Transparency**: All responses include direct links to the source documentation, maintaining trust and enabling
deeper exploration.

## Building in Public

This repository represents our approach to building AI agents that developers can trust. You can follow our development
process, see how we handle edge cases, and understand the engineering decisions behind reliable AI-powered assistance.

## For Developers

While DocsQL is primarily a demonstration project, the patterns and approaches used here are applicable to any
documentation- or unstructured-data-heavy project. The codebase shows:

- How to structure PromptQL agents for accuracy
- Effective embedding strategies for technical content
- Streaming API patterns for real-time AI responses
- Testing approaches for AI-powered applications

## Learn More

- [PromptQL Documentation](https://promptql.io/docs/) - The platform powering DocsQL
- [Architecture Deep Dive](pql/README.md) - How the AI agent is configured
- [Database Design](db/README.md) - Vector search implementation details

---

_DocsQL is built by the team at [PromptQL](https://promptql.io) as a showcase of PromptQL's capabilities for building
trustworthy AI agents._
