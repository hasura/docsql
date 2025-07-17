import { Elysia } from "elysia";
import { routes } from "./routes";

const PORT = process.env.SERVER_PORT ?? "4000";

const app = new Elysia()
  .get("/", () => "PromptQL Chat Proxy")
  .use(routes)
  .listen(PORT);

console.log(`Server running on http://localhost:${process.env.SERVER_PORT}`);
// Test comment
