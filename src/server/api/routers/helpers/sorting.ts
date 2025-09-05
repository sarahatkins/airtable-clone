import { alias } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { asc, desc, and, eq, sql } from "drizzle-orm";
import { cellValues, type rows } from "~/server/db/schemas/tableSchema";

type SortingType = {
  columnId: number;
  direction: "asc" | "desc";
};

type SortingClause = {
  alias: ReturnType<typeof alias>;
  on: SQL;
  orderBy: SQL;
};

export function buildSortingClauses(
  sorting: SortingType[],
  rowTable: typeof rows,
): SortingClause[] {
  return sorting.map((sort, index) => {
    if (sort.columnId === undefined) {
      throw new Error(`sort.columnId is undefined for index ${index}`);
    }

    const joinAlias = alias(cellValues, `sort${index}`);

    const onCondition = and(
      eq(joinAlias.rowId, rowTable.id),
      eq(joinAlias.columnId, sort.columnId),
    );

    return {
      alias: joinAlias,
      on: onCondition ?? sql`TRUE`,
      orderBy:
        sort.direction === "asc"
          ? asc(sql`${joinAlias}.value`)
          : desc(sql`${joinAlias}.value`),
    };
  });
}

