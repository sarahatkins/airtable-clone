import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  table,
  columns,
  rows,
  cellValues,
  views,
} from "~/server/db/schemas/tableSchema";
import { eq, and, inArray, gt, sql, asc, desc } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { db } from "~/server/db";
import {
  DEFAULT_VIEW_CONFIG,
  type CellNoId,
  type CellType,
  type CellValue,
  type ColType,
  type RowType,
  type TableType,
  type ViewConfigType,
  type ViewType,
} from "~/app/defaults";
import { buildFilter, validateFilterGroup } from "./helpers/filtering";
import { alias } from "drizzle-orm/pg-core";

// Types
const CellValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

// Define FilterLeaf
const FilterLeafSchema = z.object({
  functionName: z.enum([
    "eq",
    "neq",
    "contains",
    "notContains",
    "isEmpty",
    "isNotEmpty",
    "gt",
    "lt",
    "gte",
    "lte",
  ]),
  args: z.tuple([z.number(), CellValueSchema]),
});

// Define FilterGroup
const FilterGroupSchema = z.object({
  functionName: z.enum(["and", "or"]),
  args: z.array(FilterLeafSchema),
});

const ViewConfigSchema = z.object({
  filters: FilterGroupSchema.optional(),
  sorting: z
    .array(
      z.object({
        columnId: z.number(),
        direction: z.enum(["asc", "desc"]),
      }),
    )
    .optional(),
  hiddenColumns: z.array(z.number()),
});

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

  deleteTable: publicProcedure
    .input(z.object({ tableId: z.number() }))
    .mutation(async ({ input }) => {
      const deletedCount = await db
        .delete(table)
        .where(eq(table.id, input.tableId))
        .returning();

      if (deletedCount.length === 0) {
        throw new Error("Table not found or already deleted");
      }

      return { success: true };
    }),

  renameTable: publicProcedure
    .input(z.object({ tableId: z.number(), newName: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const updatedCount = await db
        .update(table)
        .set({ name: input.newName })
        .where(eq(table.id, input.tableId))
        .returning();

      if (updatedCount.length === 0) {
        throw new Error("Table not found or update failed");
      }

      return { success: true, newName: input.newName };
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
    .query(async ({ input, ctx }) => {
      const allCols = await ctx.db
        .select()
        .from(columns)
        .where(eq(columns.tableId, input.tableId))
        .orderBy(columns.orderIndex);

      return { cols: allCols };
    }),

  deleteColumn: publicProcedure
    .input(z.object({ columnId: z.number() }))
    .mutation(async ({ input }) => {
      const deletedCount = await db
        .delete(columns)
        .where(eq(columns.id, input.columnId))
        .returning();

      if (deletedCount.length === 0) {
        throw new Error("Column not found or already deleted");
      }

      return { success: true };
    }),

  renameColumn: publicProcedure
    .input(z.object({ colId: z.number(), newName: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const updatedCount = await db
        .update(columns)
        .set({ name: input.newName })
        .where(eq(columns.id, input.colId))
        .returning();

      if (updatedCount.length === 0) {
        throw new Error("Column not found or update failed");
      }

      return { success: true, newName: input.newName };
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

  deleteRows: publicProcedure
    .input(z.object({ rowIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const deletedCount = await db
        .delete(rows)
        .where(inArray(rows.id, input.rowIds))
        .returning();

      if (deletedCount.length === 0) {
        throw new Error("Column not found or already deleted");
      }

      return { success: true };
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
        console.log("Row ", i);
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
          let fakeValue: CellValue;

          switch (col.type) {
            case "text":
              fakeValue = faker.lorem.words(3);
              break;
            case "number":
              fakeValue = faker.number.int({ max: 100 });
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

      console.log("finished inserting rows");

      // Insert cells in chunks
      for (let i = 0; i < newCells.length; i += 1000) {
        const chunk = newCells.slice(i, i + 1000);
        await db.insert(cellValues).values(chunk);
        console.log("cell ", i);
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

  getNumRows: publicProcedure
    .input(z.object({ tableId: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(rows)
        .where(eq(rows.tableId, input.tableId));

      return { count: Number(result[0]?.count ?? 0) };
    }),

  // ------------------ ROWS ------------------
  createView: publicProcedure
    .input(
      z.object({
        tableId: z.number(),
        name: z.string(),
        config: ViewConfigSchema.optional(),
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
        config: ViewConfigSchema,
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

  deleteView: publicProcedure
    .input(z.object({ viewId: z.number() }))
    .mutation(async ({ input }) => {
      const deletedCount = await db
        .delete(views)
        .where(eq(views.id, input.viewId))
        .returning();

      if (deletedCount.length === 0) {
        throw new Error("View not found or already deleted");
      }

      return { success: true };
    }),

  renameView: publicProcedure
    .input(z.object({ viewId: z.number(), newName: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const updatedCount = await db
        .update(views)
        .set({ name: input.newName })
        .where(eq(views.id, input.viewId))
        .returning();

      if (updatedCount.length === 0) {
        throw new Error("View not found or update failed");
      }

      return { success: true, newName: input.newName };
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

      if (existing?.[0]) {
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
        limit: z.number().default(500),
        cursor: z.number().optional(),
        searchText: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { viewId, limit, cursor, searchText } = input;

      // Get respective view
      const [view] = await ctx.db
        .select({ config: views.config, tableId: views.tableId })
        .from(views)
        .where(eq(views.id, viewId));

      if (!view) throw new Error("View not found");

      // Extract config
      const { filters: filterTree, sorting } = view.config as ViewConfigType;

      // Build WHERE conditions
      const conditions = [eq(rows.tableId, view.tableId)];

      if (filterTree && filterTree.args.length > 0) {
        validateFilterGroup(filterTree);
        conditions.push(buildFilter(filterTree));
      }

      if (cursor) {
        conditions.push(gt(rows.id, cursor));
      }

      // Base query (only rows)
      let rowQuery: any = ctx.db
        .select({ id: rows.id })
        .from(rows)
        .where(and(...conditions))
        .$dynamic();

      // ========= SEARCH ============
      if (searchText) {
        rowQuery = rowQuery
          .leftJoin(cellValues, eq(cellValues.rowId, rows.id))
          .where(
            and(
              ...conditions,
              sql`${cellValues.value}::text ILIKE ${`%${searchText}%`}`,
            ),
          );
      }

      // ========= Sorting =========
      const sortAliases = sorting.map((s, i) => alias(cellValues, `sort_${i}`));

      sorting.forEach((sort, i) => {
        const sortAlias = sortAliases[i];
        if (!sortAlias) return;

        rowQuery = rowQuery.leftJoin(
          sortAlias,
          and(
            eq(rows.id, sortAlias.rowId),
            eq(sortAlias.columnId, sort.columnId),
          ),
        );
      });
      const orderBys = sorting.map((sort, i) => {
        const sortAlias = sortAliases[i];
        if (!sortAlias) return;
        return sort.direction === "asc"
          ? asc(sql`${sortAlias.value}::text`)
          : desc(sql`${sortAlias.value}::text`);
      });

      // Always add rows.id for stable pagination (last tiebreaker)
      orderBys.push(asc(rows.id));

      // ========= Pagination =========
      rowQuery = rowQuery.orderBy(...orderBys).limit(limit + 1);

      // ========= Execute =========
      const rowsRes = (await rowQuery) as RowType[];

      if (rowsRes.length === 0) {
        return { rows: [], nextCursor: null };
      }

      const rowIds = rowsRes.map((r: RowType) => r.id);

      // Fetch related cells separately
      const cellsRes = (await ctx.db
        .select()
        .from(cellValues)
        .where(inArray(cellValues.rowId, rowIds))) as CellType[];

      // Hydrate rows with cells
      const rowsWithCells = rowsRes.map((r: RowType) => ({
        ...r,
        cells: cellsRes.filter((c) => c.rowId === r.id),
      }));

      // Compute next cursor
      const nextCursor =
        rowsRes.length > limit ? rowsRes[rowsRes.length - 1]?.id : undefined;

      return {
        rows: rowsWithCells,
        nextCursor,
      };
    }),
});
