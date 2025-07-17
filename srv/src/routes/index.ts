import { Elysia } from "elysia";
import { chatRoutes } from "./chat";

export const routes = new Elysia().use(chatRoutes);
