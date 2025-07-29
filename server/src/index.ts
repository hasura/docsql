import { Elysia } from "elysia";
import { routes } from "./routes";

const PORT = process.env.PORT ?? process.env.SERVER_PORT ?? "4000";

const app = new Elysia()
  .get("/", () => "PromptQL Chat Proxy")
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .use(routes);

try {
  app.listen(PORT);
  console.log(`⚡️ PromptQL Chat Proxy is running on port ${PORT}!`);
  console.log(`🤖 Ready to handle chat requests!`);
} catch (error) {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  process.exit(0);
});
