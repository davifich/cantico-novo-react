import { createTRPCRouter } from "./create-context";
import hiRouter from "./routers/example/hi.route";
import userRouter from "./routers/user.route";
import { transcriptionRouter } from "./routers/transcription";
import { songRouter } from "./routers/song.route";

export const appRouter = createTRPCRouter({
  example: hiRouter,
  user: userRouter,
  transcription: transcriptionRouter,
  song: songRouter,
});

export type AppRouter = typeof appRouter;
