import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { base } from "~/server/db/schemas/tableSchema"; // your Drizzle table
import { eq, type InferSelectModel } from "drizzle-orm";
import { db } from "~/server/db";

export type Base = InferSelectModel<typeof base>;

export const baseRouter = createTRPCRouter({
  // Create a new base
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [newBase] = await ctx.db
        .insert(base)
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
      const res = await db.select().from(base).orderBy(base.id);

      return res;
    }),

  // Get a single base by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const [foundBase] = await ctx.db
        .select()
        .from(base)
        .where(eq(base.id, input.id));

      return foundBase;
    }),

  // Update a base name
  update: protectedProcedure
    .input(z.object({ id: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const [updatedBase] = await db
        .update(base)
        .set({ name: input.name })
        .where(eq(base.id, input.id))
        .returning();

      return updatedBase;
    }),

  // Delete a base
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await db.delete(base).where(eq(base.id, input.id));
      return { success: true };
    }),
});

