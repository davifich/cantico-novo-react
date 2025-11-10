import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { supabaseServer } from "../supabase";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  let user = null;

  if (token) {
    const { data } = await supabaseServer.auth.getUser(token);
    user = data.user;
  }

  return {
    req: opts.req,
    user,
    supabase: supabaseServer,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new Error("Unauthorized");
  return next();
});
