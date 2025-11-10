import { createTRPCRouter } from "./create-context";
import hiRouter from "./routers/example/hi.route";
import userRouter from "./routers/user.route";

export const appRouter = createTRPCRouter({
  example: hiRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
