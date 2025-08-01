import { Elysia } from "elysia";
import { routes } from "./routes";

const PORT = process.env.PORT ?? process.env.SERVER_PORT ?? "4000";

const app = new Elysia()
  .onRequest(({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = "*";
    set.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type";
  })
  .get("/", () => "PromptQL Chat Proxy")
  .get("/health", ({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = "*";
    return { status: "ok", timestamp: new Date().toISOString() };
  })
  .options("/health", ({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = "*";
    set.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type";
    return "";
  })
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
