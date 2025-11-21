import { protectedProcedure, createTRPCRouter } from "../create-context";
import { z } from "zod";
import { supabaseServer } from "../../supabase";
import { TRPCError } from "@trpc/server";

export const transcriptionRouter = createTRPCRouter({
  transcribe: protectedProcedure
    .input(
      z.object({
        storagePath: z.string().min(1),
        fileName: z.string().optional(),
        audioUri: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabaseServer.functions.invoke(
        "transcribe-audio",
        {
          body: { storagePath: input.storagePath },
        }
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro na Edge Function: ${error.message}`,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `A Edge Function retornou um formato inválido.`,
        });
      }

      return {
        ...data,
        fileName: input.fileName,
        audioUri: input.audioUri,
      };
    }),
});
