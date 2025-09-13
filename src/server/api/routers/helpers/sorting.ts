import { and, eq, gt, lt, or, sql, SQL } from "drizzle-orm";
import { alias, type PgTableWithColumns } from "drizzle-orm/pg-core";
import z from "zod";
import type { cellValues as CellValueType } from "~/server/db/schemas/tableSchema";
import { cellValues, rows } from "~/server/db/schemas/tableSchema";

// Infer types from Zod
const CursorValSchema = z.object({
  colId: z.number(),
  value: z.union([z.string(), z.number(), z.null()]),
  direction: z.enum(["asc", "desc"]),
});

export const CursorSchema = z.object({
  rowId: z.number(),
  cursorVals: z.array(CursorValSchema),
});

export type Cursor = z.infer<typeof CursorSchema>;

export function createCellValueAlias(name: string) {
  return alias(cellValues, name);
}

type CellValuesAlias = ReturnType<typeof createCellValueAlias>;

export interface SortAlias {
  columnId: number;
  alias: CellValuesAlias;
}
//  Build WHERE clause to find specific chunk based on cursor
export const findRowChunk = (
  cursor: Cursor,
  sortAliases: SortAlias[],
): SQL | undefined => {
  if (cursor.cursorVals.length === 0) return;

  const orConditions: SQL[] = [];

  for (let i = 0; i < cursor.cursorVals.length; i++) {
    const andConditions: SQL[] = [];
    console.log(cursor.cursorVals.length);
    // All previous values must match exactly
    for (let j = 0; j < i; j++) {
      const prevCursor = cursor.cursorVals[j];
      const prevAlias = sortAliases[j];
      if (!prevCursor || !prevAlias) {
        throw new Error("Invalid cursor or alias at index " + j);
      }

      console.log("PREV CUR + ALIAS ONE", prevCursor);
      const valueCol = prevAlias.alias.value;

      if (prevCursor.value === null) {
        console.log("hehe");
        andConditions.push(eq(valueCol, null));
      } else {
        console.log("haha");
        andConditions.push(eq(valueCol, prevCursor.value));
      }
    }

    const currCursor = cursor.cursorVals[i];
    const currAlias = sortAliases[i]; // in order of the orders given
    // first -> val is col  9, val 2, dir asc
    // second -> col 6 val 'a', dis asc
    console.log("CURR CUR + ALIAS TWO", currCursor);

    if (!currCursor || !currAlias) {
      throw new Error("Invalid current cursor or alias at index " + i);
    }

    const valueCol = currAlias.alias.value;

    // Add inequality based on cursor direction
    if (currCursor.value === null) {
      // Treat null as smallest — so anything NOT null is greater
      andConditions.push(sql`${valueCol} IS NOT NULL`);
    } else if (currCursor.direction === "asc") {
      andConditions.push(gt(valueCol, currCursor.value));
    } else {
      andConditions.push(lt(valueCol, currCursor.value));
    }

    if (i === cursor.cursorVals.length - 1) {
      andConditions.push(gt(rows.id, cursor.rowId));
    }
    
    const andExpr = and(...andConditions);
    if (andExpr) {
      orConditions.push(andExpr);
    }
  }

  // Final tie-breaker: if all values match, use rowId to break tie
  // const lastIndex = cursor.cursorVals.length - 1;
  // const lastCursor = cursor.cursorVals[lastIndex];
  // const lastAlias = sortAliases[lastIndex];

  // if (!lastCursor || !lastAlias) {
  //   throw new Error("Invalid cursor or alias ");
  // }

  // const lastValueCol = lastAlias.alias.value;

  // if (lastCursor.value === null) {
  //   orConditions.push(gt(rows.id, cursor.rowId));
  // } else {
  //   const orExpr = or(
  //     and(eq(lastValueCol, lastCursor.value), gt(rows.id, cursor.rowId)),
  //     gt(lastValueCol, lastCursor.value),
  //   );

  //   if (orExpr) {
  //     orConditions.push(orExpr);
  //   }
  // }
  console.log("OR", orConditions[0]?.queryChunks);
  return or(...orConditions);
};
