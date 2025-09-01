import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  base,
  table,
  columns,
  rows,
  cellValues,
  views,
} from "~/server/db/schemas/tableSchema"; // your Drizzle table
import { eq, type InferSelectModel, and, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import {
  DEFAULT_VIEW_CONFIG,
  type CellType,
  type ColType,
  type RowType,
  type TableType,
  type ViewType,
} from "~/app/defaults";

// Types

export const tableRouter = createTRPCRouter({
  // ------------------ TABLES ------------------
  createTable: publicProcedure
    .input(z.object({ baseId: z.string(), name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const [newTable]: TableType[] = await db
        .insert(table)
        .values({
          baseId: input.baseId,
          name: input.name,
          createdAt: new Date(),
        })
        .returning();
      return newTable;
    }),

  getTablesByBase: publicProcedure
    .input(z.object({ baseId: z.string() }))
    .query(async ({ input }) => {
      return db.select().from(table).where(eq(table.baseId, input.baseId));
    }),

  // ------------------ COLUMNS ------------------
  createColumn: publicProcedure
    .input(
      z.object({
        tableId: z.number(),
        name: z.string().min(1),
        type: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [newColumn]: ColType[] = await db
        .insert(columns)
        .values({
          tableId: Number(input.tableId),
          name: input.name,
          type: input.type,
          orderIndex: 0,
        })
        .returning();
      return newColumn;
    }),

  getColumnsByTable: publicProcedure
    .input(z.object({ tableId: z.number() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(columns)
        .where(eq(columns.tableId, Number(input.tableId)))
        .orderBy(columns.orderIndex);
    }),

  // ------------------ ROWS ------------------
  createRow: publicProcedure
    .input(z.object({ tableId: z.number() }))
    .mutation(async ({ input }) => {
      const [newRow]: RowType[] = await db
        .insert(rows)
        .values({
          tableId: Number(input.tableId),
          createdAt: new Date(),
        })
        .returning();
      return newRow;
    }),

  createRows: publicProcedure
    .input(
      z.object({
        tableId: z.number(),
        count: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const newRows = Array.from({ length: input.count }, () => ({
        tableId: input.tableId,
        createdAt: new Date(),
      }));

      // Explicitly tell Drizzle not to return inserted rows
      // Done in chunks
      for (let i = 0; i < newRows.length; i += 1000) {
        const chunk = newRows.slice(i, i + 1000);
        await db.insert(rows).values(chunk);
      }

      return { success: true, inserted: input.count };
    }),

  getRowsByTable: publicProcedure
    .input(z.object({ tableId: z.number() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(rows)
        .where(eq(rows.tableId, Number(input.tableId)));
    }),

  // ------------------ ROWS ------------------
  createView: publicProcedure
    .input(
      z.object({
        tableId: z.number(),
        name: z.string(),
        config: z.any().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const [newView]: ViewType[] = await db
        .insert(views)
        .values({
          tableId: input.tableId,
          name: input.name,
          config: input.config ?? DEFAULT_VIEW_CONFIG,
        })
        .returning();
      return newView;
    }),

  getViewByTable: publicProcedure
    .input(z.object({ tableId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(views).where(eq(views.tableId, input.tableId));
    }),

  updateViewConfig: publicProcedure
    .input(
      z.object({
        viewId: z.number(),
        config: z.any(),
      }),
    )
    .mutation(async ({ input }) => {
      const [updatedView] = await db
        .update(views)
        .set({ config: input.config })
        .where(eq(views.id, input.viewId))
        .returning();
      return updatedView;
    }),

  // ------------------ CELL VALUES ------------------
  setCellValue: publicProcedure
    .input(
      z.object({
        tableId: z.number(),
        rowId: z.number(),
        columnId: z.number(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // upsert pattern: check if exists
      const existing = await db
        .select()
        .from(cellValues)
        .where(
          and(
            eq(cellValues.rowId, Number(input.rowId)),
            eq(cellValues.columnId, Number(input.columnId)),
          ),
        )
        .limit(1);

      if (existing && existing[0] && existing.length > 0) {
        const [updated]: CellType[] = await db
          .update(cellValues)
          .set({ value: input.value })
          .where(eq(cellValues.id, existing[0].id))
          .returning();
        return updated;
      } else {
        const [newCell]: CellType[] = await db
          .insert(cellValues)
          .values({
            tableId: input.tableId,
            rowId: Number(input.rowId),
            columnId: Number(input.columnId),
            value: input.value,
          })
          .returning();
        return newCell;
      }
    }),

  getCellsByTable: publicProcedure
    .input(z.object({ tableId: z.number() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(cellValues)
        .where(eq(cellValues.tableId, input.tableId)); // assuming you have tableId in cellValues
    }),

  getCellsByRows: publicProcedure
    .input(z.object({ rowIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(cellValues)
        .where(inArray(cellValues.rowId, input.rowIds)); // fetch all cells for multiple rows in one call
    }),

  getCellsByView: publicProcedure
    .input(
      z.object({
        viewId: z.number(),
        limit: z.number().default(100),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      // 1. Get view config
      // const view = await db.query.views.findFirst({
      //   where: eq(views.id, input.viewId),
      // });
      // if (!view) throw new Error("View not found");
      // const config = view.config as {
      //   filters?: {
      //     field: string;
      //     operator: string;
      //     value: string;
      //   }[];
      // };
      // // 2. Build base row query
      // let rowQuery = db
      //   .select()
      //   .from(rows)
      //   .where(eq(rows.tableId, view.tableId));
      // if (input.cursor) {
      //   // cursor-based pagination (fetch rows with id > cursor)
      //   rowQuery = rowQuery.where(gt(rows.id, input.cursor));
      // }
      // // 3. Apply filters
      // if (config?.filters?.length) {
      //   for (const f of config.filters) {
      //     switch (f.operator) {
      //       case "equals":
      //         rowQuery = rowQuery.where(eq(rows[f.field], f.value));
      //         break;
      //       case "not_equals":
      //         rowQuery = rowQuery.where(ne(rows[f.field], f.value));
      //         break;
      //       case "contains":
      //         rowQuery = rowQuery.where(ilike(rows[f.field], `%${f.value}%`));
      //         break;
      //       case "does_not_contain":
      //         rowQuery = rowQuery.where(
      //           notIlike(rows[f.field], `%${f.value}%`),
      //         );
      //         break;
      //     }
      //   }
      // }
      // // 4. Limit (pagination)
      // rowQuery = rowQuery.limit(input.limit + 1); // fetch 1 extra for "hasMore"
      // const filteredRows = await rowQuery;
      // if (!filteredRows.length)
      //   return { rows: [], cells: [], nextCursor: null };
      // const rowIds = filteredRows.map((r) => r.id);
      // const cells = await db
      //   .select()
      //   .from(cellValues)
      //   .where(inArray(cellValues.rowId, rowIds));
      // return {
      //   rows: filteredRows.slice(0, input.limit), // return only limit
      //   cells,
      //   nextCursor:
      //     filteredRows.length > input.limit
      //       ? filteredRows[input.limit - 1].id
      //       : null,
      // };
    }),
});
