import 'dotenv/config';
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createTRPCContext } from "./trpc/create-context";

const app = new Hono();

// CORS global
app.use("*", cors());

// tRPC endpoint (v11 — CORRETO)
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: createTRPCContext,
    // Nenhum transformer aqui (v11 mudou isso)
  })
);

// Health check
app.get("/", (c) => c.json({ status: "ok", message: "API is running" }));

export default app;
