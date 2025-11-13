import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { supabaseServer } from "../supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Cria o contexto TRPC com autenticação Supabase.
 */
export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  const token = authHeader?.split(" ")[1]; // Ex: "Bearer eyJhbGciOi..."

  let user: User | null = null;

  if (token) {
    try {
      const { data, error } = await supabaseServer.auth.getUser(token);
      if (error) {
        console.warn("[TRPC Context] Erro ao buscar usuário Supabase:", error.message);
      } else if (data?.user) {
        user = data.user;
      }
    } catch (err) {
      console.error("[TRPC Context] Erro inesperado ao autenticar usuário:", err);
    }
  }

  return {
    req: opts.req,
    user,
    supabase: supabaseServer,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// --- Inicializa TRPC com transformer e error formatter ---
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;

/**
 * Procedimento público — qualquer cliente pode chamar.
 */
export const publicProcedure = t.procedure;

/**
 * Procedimento protegido — requer usuário autenticado.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuário não autenticado.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
