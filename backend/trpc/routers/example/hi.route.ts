import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../create-context";

export default createTRPCRouter({
  hi: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => ({
      message: `Hello, ${input.name}!`,
      date: new Date().toISOString(),
    })),
});
