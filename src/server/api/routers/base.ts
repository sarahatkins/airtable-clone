import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { bases } from "~/server/db/schemas/tableSchema"; // your Drizzle table
import { eq } from "drizzle-orm";
import { db } from "~/server/db";

export const baseRouter = createTRPCRouter({
  // Create a new base
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [newBase] = await ctx.db
        .insert(bases)
        .values({
          name: input.name,
          userId: ctx.session.user.id,
          createdAt: new Date(),
        })
        
        .returning();

      return newBase;
    }),

  // Get all base for a user
  getAll: protectedProcedure
    .input(z.object({ userId: z.string().min(1) })) // assuming you store ownership
    .query(async ({ input }) => {
      const res = await db.select().from(bases).where(eq(bases.userId, input.userId)).orderBy(bases.id);

      return res;
    }),

  // Get a single base by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [foundBase] = await ctx.db
        .select()
        .from(bases)
        .where(eq(bases.id, input.id));

      return foundBase;
    }),

  renameBase: protectedProcedure
    .input(z.object({ id: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const [updatedBase] = await db
        .update(bases)
        .set({ name: input.name })
        .where(eq(bases.id, input.id))
        .returning();

      return updatedBase;
    }),

  deleteBase: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await db.delete(bases).where(eq(bases.id, input.id));
      return { success: true };
    }),
});

