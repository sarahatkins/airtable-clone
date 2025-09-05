import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  table,
  columns,
  rows,
  cellValues,
  views,
} from "~/server/db/schemas/tableSchema"; // your Drizzle table
import { eq, and, inArray, gt, ilike, lt, sql } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { db } from "~/server/db";
import {
  DEFAULT_VIEW_CONFIG,
  type CellNoId,
  type CellType,
  type ColType,
  type RowType,
  type TableType,
  type ViewConfigType,
  type ViewType,
} from "~/app/defaults";
import { buildFilter, validateFilterGroup } from "./helpers/filtering";

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

  createFilledRows: publicProcedure
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

      // Insert rows in chunks and collect inserted rows with IDs
      const insertedRows: { id: number }[] = [];

      for (let i = 0; i < newRows.length; i += 1000) {
        const chunk = newRows.slice(i, i + 1000);
        const insertedChunk = await db
          .insert(rows)
          .values(chunk)
          .returning({ id: rows.id }); // Get back the inserted IDs
        insertedRows.push(...insertedChunk);
      }

      // Fetch columns for the table
      const tableColumns = await db
        .select()
        .from(columns)
        .where(eq(columns.tableId, input.tableId));

      const newCells: CellNoId[] = [];

      // Use insertedRows with real IDs here
      for (const row of insertedRows) {
        for (const col of tableColumns) {
          let fakeValue: any;

          switch (col.type) {
            case "single_line":
              fakeValue = faker.lorem.words(3);
              break;
            case "multi_line":
              fakeValue = faker.lorem.paragraph();
              break;
            case "checkbox":
              fakeValue = faker.datatype.boolean();
              break;
            case "select":
              fakeValue = faker.lorem.word();
              break;
            case "date":
              fakeValue = faker.date.past().toISOString();
              break;
            case "number":
              fakeValue = faker.number.int({ max: 100 });
              break;
            case "user":
              fakeValue = faker.internet.email();
              break;
            default:
              fakeValue = faker.lorem.word();
          }

          newCells.push({
            tableId: input.tableId,
            rowId: row.id, // now valid
            columnId: col.id,
            value: JSON.stringify(fakeValue),
          });
        }
      }

      // Insert cells in chunks
      for (let i = 0; i < newCells.length; i += 1000) {
        const chunk = newCells.slice(i, i + 1000);
        await db.insert(cellValues).values(chunk);
      }

      return {
        success: true,
        rowsInserted: insertedRows.length,
        cellsInserted: newCells.length,
      };
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

  getFilterCells: publicProcedure
    .input(
      z.object({
        viewId: z.number(),
        limit: z.number().default(500), // batch size
        cursor: z.number().optional(), // last processed row id
      }),
    )
    .query(async ({ input, ctx }) => {
      const { viewId, limit, cursor } = input;

      // Get respective view
      const [view] = await ctx.db
        .select({ config: views.config, tableId: views.tableId })
        .from(views)
        .where(eq(views.id, viewId));

      if (!view) throw new Error("View not found");

      // Find filter tree
      const { filters: filterTree } = view.config as ViewConfigType;

      // Begin filtering and constructing the sql
      let whereExpr = sql`TRUE`
      if (filterTree) {
        validateFilterGroup(filterTree);
        whereExpr = buildFilter(filterTree);
      }
      
      const conditions = [eq(rows.tableId, view.tableId)]; // mandatory condition
      
      if (whereExpr) conditions.push(whereExpr);
      if (cursor) conditions.push(gt(rows.id, cursor));
      
      const query = ctx.db
      .select()
      .from(rows)
      .where(and(...conditions)) // combine all with AND
      .orderBy(rows.id)
      .limit(limit);
      console.log("QUERYSQL", query.toSQL());

      const rowsRes = await query;

      if (rowsRes.length === 0)
        return { rows: [], cells: [], nextCursor: null };
      const rowIds = rowsRes.map((r) => r.id);

      const cellsRes = await ctx.db
        .select()
        .from(cellValues)
        .where(inArray(cellValues.rowId, rowIds));

      // Group cells by row
      const rowsWithCells = rowsRes.map((r) => ({
        ...r,
        cells: cellsRes.filter((c) => c.rowId === r.id),
      }));

      const nextCursor =
        rowsRes.length === limit ? rowsRes[rowsRes.length - 1]?.id : undefined;
      // Return rows + next cursor
      return {
        rows: rowsWithCells,
        nextCursor,
      };
    }),
});
