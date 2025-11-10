import { createTRPCRouter, protectedProcedure } from "../create-context";

export default createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
});
