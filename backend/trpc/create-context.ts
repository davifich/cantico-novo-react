import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { supabaseServer } from "../supabase";
import type { User } from "@supabase/supabase-js";

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  let user: User | null = null;

  if (token) {
    const { data, error } = await supabaseServer.auth.getUser(token);
    if (!error && data?.user) {
      user = data.user;
    }
  }

  return {
    req: opts.req,
    user,
    supabase: supabaseServer,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// ✔ IMPORTANTE: transformer aqui
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx });
});
