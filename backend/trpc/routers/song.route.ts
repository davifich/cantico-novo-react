
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../create-context';
import * as songService from '../../../lib/database';
import { AddSongDTOSchema } from '../../../types/music';

export const songRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return await songService.getAllSongs();
  }),
  create: publicProcedure.input(AddSongDTOSchema).mutation(async ({ input }) => {
    const newSongId = await songService.addSong(input);
    return newSongId;
  }),
  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await songService.deleteSong(input.id);
    return { success: true };
  }),
  addToCategory: publicProcedure
    .input(z.object({ songId: z.number(), categoryId: z.number() }))
    .mutation(async ({ input }) => {
      await songService.addSongToCategory(input.songId, input.categoryId);
      return { success: true };
    }),
  removeFromCategory: publicProcedure
    .input(z.object({ songId: z.number(), categoryId: z.number() }))
    .mutation(async ({ input }) => {
      await songService.removeSongFromCategory(input.songId, input.categoryId);
      return { success: true };
    }),
});
