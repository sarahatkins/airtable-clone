import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import {
  table,
  columns,
  rows,
  cellValues,
  views,
} from "~/server/db/schemas/tableSchema"; // your Drizzle table
import {
  eq,
  and,
  inArray,
  gt,
  sql,
  asc,
  desc,
} from "drizzle-orm";
import { db } from "~/server/db";
import {
  DEFAULT_VIEW_CONFIG,
  type CellType,
  type ColType,
  type RowType,
  type TableType,
  type ViewConfigType,
  type ViewType,
} from "~/app/defaults";
import { operatorMap } from "./helpers/filterHelpers";
import { alias } from "drizzle-orm/pg-core";

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

  // getCellsByView: publicProcedure
  //   .input(
  //     z.object({
  //       viewId: z.number(),
  //       limit: z.number().default(100),
  //       cursor: z.number().optional(),
  //     }),
  //   )
  //   .query(async ({ input }) => {
  //     // 1. Fetch the view + config
  //     const [view] = await db
  //       .select()
  //       .from(views)
  //       .where(eq(views.id, input.viewId))
  //       .limit(1);

  //     if (!view || !view.tableId) throw new Error("View not found");

  //     const config = view.config as {
  //       filters?: {
  //         columnId: number;
  //         operator: keyof typeof operatorMap;
  //         value: string | number;
  //       }[];
  //     };

  //     // 2. Collect conditions
  //     const conditions: any[] = [eq(rows.tableId, view.tableId)];

  //     if (input.cursor) {
  //       conditions.push(gt(rows.id, input.cursor));
  //     }

  //     // If filters exist, push filter conditions (on cellValues)
  //     let useJoin = false;
  //     if (config?.filters?.length) {
  //       useJoin = true;
  //       for (const f of config.filters) {
  //         const operatorFn = operatorMap[f.operator];
  //         if (operatorFn) {
  //           conditions.push(operatorFn(cellValues.value, f.value));
  //           conditions.push(eq(cellValues.columnId, f.columnId)); // filter must match correct column
  //         }
  //       }
  //     }

  //     // 3. Build row query
  //     let rowQuery: any = db
  //       .select({ id: rows.id }) // only need IDs here
  //       .from(rows);

  //     if (useJoin) {
  //       rowQuery = rowQuery.innerJoin(cellValues, eq(rows.id, cellValues.rowId));
  //     }

  //     rowQuery = rowQuery
  //       .where(and(...conditions))
  //       .limit(input.limit + 1);

  //     const filteredRows = await rowQuery;

  //     if (!filteredRows.length) {
  //       return { rows: [], cells: [], nextCursor: null };
  //     }

  //     const rowIds = filteredRows.map((r: RowType) => r.id);

  //     // 4. Fetch all cells for the filtered rows
  //     const cells = await db
  //       .select()
  //       .from(cellValues)
  //       .where(inArray(cellValues.rowId, rowIds));

  //     return {
  //       rows: filteredRows.slice(0, input.limit),
  //       cells,
  //       nextCursor:
  //         filteredRows.length > input.limit
  //           ? filteredRows[input.limit - 1]?.id
  //           : null,
  //     };
  //   }),

  getCellsByView: publicProcedure
    .input(
      z.object({
        viewId: z.number(),
        limit: z.number().default(100),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const [view] = await db
        .select()
        .from(views)
        .where(eq(views.id, input.viewId))
        .limit(1);

      if (!view || !view.tableId) throw new Error("View not found");

      const config = view.config as ViewConfigType;

      const filters = config.filters ?? [];
      const sorting = config.sorting ?? [];

      const conditions: any[] = [eq(rows.tableId, view.tableId)];

      if (input.cursor) {
        conditions.push(gt(rows.id, input.cursor));
      }

      // ========== Filtering ==========
      let filterJoinNeeded = false;

      if (filters.length > 0) {
        filterJoinNeeded = true;

        for (const filter of filters) {
          const operatorFn = operatorMap[filter.operator];
          if (!operatorFn) continue;

          // Apply filter using helper
          conditions.push(
            operatorFn(sql`${cellValues.value}::text`, filter.value),
          );
          conditions.push(eq(cellValues.columnId, filter.columnId));
        }
      }

      // ========== Sorting ==========
      const sortAliases = sorting.map((s, i) => alias(cellValues, `sort_${i}`));

      let rowQuery: any = db.select({ id: rows.id }).from(rows);

      // Add LEFT JOINs for sorting
      sortAliases.forEach((aliasRef, i) => {
        rowQuery = rowQuery.leftJoin(
          aliasRef,
          and(
            eq(rows.id, aliasRef.rowId),
            eq(aliasRef.columnId, sorting[i]!.columnId),
          ),
        );
      });

      // Add INNER JOIN for filtering if needed
      if (filterJoinNeeded) {
        rowQuery = rowQuery.innerJoin(
          cellValues,
          eq(rows.id, cellValues.rowId),
        );
      }

      // Add WHERE
      rowQuery = rowQuery.where(and(...conditions));

      // Add ORDER BY from sorting
      sorting.forEach((sort, i) => {
        const aliasRef = sortAliases[i];
        rowQuery = rowQuery.orderBy(
          sort.direction === "asc"
            ? asc(sql`${aliasRef!.value}::text`) // or cast to ::numeric if needed
            : desc(sql`${aliasRef!.value}::text`),
        );
      });

      // Add pagination limit
      rowQuery = rowQuery.limit(input.limit + 1);

      const filteredRows = await rowQuery;

      if (!filteredRows.length) {
        return { rows: [], cells: [], nextCursor: null };
      }

      const rowIds = filteredRows.map((r: RowType) => r.id);

      // Fetch cell values for these rows
      const cells = await db
        .select()
        .from(cellValues)
        .where(inArray(cellValues.rowId, rowIds));

      return {
        rows: filteredRows.slice(0, input.limit),
        cells,
        nextCursor:
          filteredRows.length > input.limit
            ? filteredRows[input.limit - 1]?.id
            : null,
      };
    }),
});
