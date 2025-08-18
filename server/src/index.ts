import * as Sentry from "@sentry/bun";
import { Elysia } from "elysia";
import { routes } from "./routes";

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: 1.0,
});

const PORT = process.env.PORT ?? process.env.SERVER_PORT ?? "4000";

const app = new Elysia()
  .onError(({ error, code, set }) => {
    // Capture error in Sentry
    Sentry.captureException(error);

    console.error("Server error:", error);

    // Return appropriate error response
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation failed", message: error.message };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }

    // Generic server error
    set.status = 500;
    return { error: "Internal server error" };
  })
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
  Sentry.captureException(error);
  await Sentry.flush(2000);
  process.exit(1);
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  await Sentry.flush(2000);
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  await Sentry.flush(2000);
  process.exit(0);
});
