import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  table,
  columns,
  rows,
  cellValues,
  views,
} from "~/server/db/schemas/tableSchema";
import { eq, and, inArray, gt, sql, asc, desc, SQL } from "drizzle-orm";
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
import {
  createCellValueAlias,
  CursorSchema,
  findRowChunk,
  type Cursor,
  type SortAlias,
} from "./helpers/sorting";

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
    "is",
    "isNot",
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
        type: z.enum(["text", "number"]),
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
          type: input.type.toLowerCase(),
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
    .mutation(async function* ({ input }) {
      yield { type: "start", message: "Started streaming..." };
      const newRows = Array.from({ length: input.count }, () => ({
        tableId: input.tableId,
        createdAt: new Date(),
      }));

      // Insert rows in chunks and collect inserted rows with IDs
      const insertedRows: { id: number }[] = [];
      const newCells: CellNoId[] = [];

      for (let i = 0; i < newRows.length; i += 1000) {
        const chunk = newRows.slice(i, i + 1000);
        const insertedChunk = await db
          .insert(rows)
          .values(chunk)
          .returning({ id: rows.id }); // Get back the inserted IDs
        insertedRows.push(...insertedChunk);

        // Fetch columns for the table
        const tableColumns = await db
          .select()
          .from(columns)
          .where(eq(columns.tableId, input.tableId));

        // Use insertedRows with real IDs here
        // loop through rows in chunks and form the cells that need to be push
        for (const row of insertedChunk) {
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
              rowId: row.id,
              columnId: col.id,
              value: JSON.stringify(fakeValue),
              type: col.type,
            });
          }
        }

        // Insert cells in chunks
        for (let j = 0; j < newCells.length; j += 1000) {
          const chunk = newCells.slice(j, j + 1000);
          await db.insert(cellValues).values(chunk);
        }

        yield { type: "rowsFilled", value: i };
        newCells.slice(0, newCells.length);
      }

      yield { type: "end", message: "Stream finished." };
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
        type: z.string(),
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
            type: input.type.toLowerCase(),
          })
          .returning();
        return newCell;
      }
    }),

  getFilterCells: publicProcedure
    .input(
      z.object({
        viewId: z.number(),
        limit: z.number().default(500),
        cursor: CursorSchema.optional(),
        searchText: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { viewId, limit, cursor, searchText } = input;

      // Get view
      const [view] = await ctx.db
        .select({ config: views.config, tableId: views.tableId })
        .from(views)
        .where(eq(views.id, viewId));

      if (!view) throw new Error("View not found");

      const { filters: filterTree, sorting } = view.config as ViewConfigType;
      const baseConditions = [eq(rows.tableId, view.tableId)];

      if (filterTree?.args.length) {
        validateFilterGroup(filterTree);
        baseConditions.push(buildFilter(filterTree));
      }

      // const sortAliases = sorting.map((_, i) => alias(cellValues, `sort_${i}`));
      const sortAliases: SortAlias[] = sorting.map((sort, i) => ({
        columnId: sort.columnId,
        alias: createCellValueAlias(`sort_${i}`),
      }));
      // Build sort joins
      sorting.forEach((sort, i) => {
        const sortAlias = sortAliases[i];
        if (!sortAlias) return;

        baseConditions.push(
          eq(rows.id, sortAlias.alias.rowId),
          eq(sortAlias.alias.columnId, sort.columnId),
        );
      });

      // Start row query
      let rowQuery = ctx.db
        .select({
          id: rows.id,
          ...Object.fromEntries(
            sorting.map((_, i) => [`sort_${i}`, sortAliases[i]?.alias.value]),
          ),
        })
        .from(rows)
        .$dynamic();

      // Apply joins for sort aliases
      sorting.forEach((sort, i) => {
        const sortAlias = sortAliases[i];
        if (!sortAlias) return;

        rowQuery = rowQuery.leftJoin(
          sortAlias.alias,
          and(
            eq(rows.id, sortAlias.alias.rowId),
            eq(sortAlias.alias.columnId, sort.columnId),
          ),
        );
      });

      // Apply filters
      const whereClauses: SQL[] = [...baseConditions];
      // rowQuery = rowQuery.where(and(...baseConditions));

      // Search (optional)
      if (searchText) {
        rowQuery = rowQuery.leftJoin(cellValues, eq(cellValues.rowId, rows.id));
        whereClauses.push(
          sql`${cellValues.value}::text ILIKE ${`%${searchText}%`}`,
        );
        // .where(
        //   and(
        //     ...baseConditions,
        //     sql`${cellValues.value}::text ILIKE ${`%${searchText}%`}`,
        //   ),
        // );
      }

      // Order by sort values + rowId (stable ordering)
      const orderBys = sorting
        .map((sort, i) => {
          const sortAlias = sortAliases[i];
          if (!sortAlias) return;

          const valueExpr =
            sort.type === "number"
              ? sql`(${sortAlias.alias.value} #>> '{}')::numeric`
              : sql`LOWER(${sortAlias.alias.value}::text)`;

          return sort.direction === "asc" ? asc(valueExpr) : desc(valueExpr);
        })
        .filter(Boolean) as (
        | ReturnType<typeof asc>
        | ReturnType<typeof desc>
      )[];

      orderBys.push(asc(rows.id));

      rowQuery = rowQuery.orderBy(...orderBys);

      // Cursor logic
      if (cursor) {
        const cursorCondition = findRowChunk(cursor, sortAliases);
        if (cursorCondition) {
          whereClauses.push(cursorCondition);
        }
      }

      // Pagination
      rowQuery = rowQuery.where(and(...whereClauses)).limit(limit + 1);
      const rowsRes = await rowQuery;

      if (rowsRes.length === 0) {
        return { rows: [], matchedCells: [], nextCursor: null };
      }

      const paginatedRows = rowsRes.slice(0, limit);
      const rowIds = paginatedRows.map((r) => r.id);

      // Fetch related cells
      const cellsRes = await ctx.db
        .select()
        .from(cellValues)
        .where(inArray(cellValues.rowId, rowIds));

      const matchedCells = searchText
        ? cellsRes.filter((c) =>
            c.value
              ?.toString()
              .toLowerCase()
              .includes(searchText.toLowerCase()),
          )
        : [];

      const rowsWithCells = paginatedRows.map((row) => ({
        ...row,
        cells: cellsRes.filter((cell) => cell.rowId === row.id),
      }));

      // Build nextCursor

      let nextCursor: Cursor | null = null;
      if (rowsRes.length > limit) {
        const lastRow = rowsRes[limit - 1];

        if (lastRow) {
          nextCursor = {
            rowId: lastRow.id,
            cursorVals: sorting.map((sort, i) => ({
              colId: sort.columnId,
              value:
                (lastRow as Record<string, string | number | null>)[
                  `sort_${i}`
                ] ?? null,
              direction: sort.direction,
            })),
          };
        }
      }

      return {
        rows: rowsWithCells,
        matchedCells,
        nextCursor,
      };
    }),
});
