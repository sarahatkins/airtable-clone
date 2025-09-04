import {
  eq,
  ne,
  ilike,
  notIlike,
  gt,
  lt,
  SQL,
  sql,
  and,
  not,
} from "drizzle-orm";
import type { FilterOperator, FilterType } from "~/app/defaults";
import { cellValues } from "~/server/db/schemas/tableSchema";

export const applyFilters = (filters: FilterType[]): any[] => {
  const conditions = filters.map((filter) => {
    const col = cellValues.columnId;
    const val = cellValues.value;

    const columnMatch = eq(col, filter.columnId);

    let condition: SQL;

    switch (filter.operator) {
      case "equals":
        condition = eq(val, filter.value);
        break;
      case "notEquals":
        condition = not(eq(val, filter.value));
        break;
      case "contains":
        condition = ilike(sql`${val}::text`, `%${filter.value}%`);
        break;
      case "notContains":
        condition = not(ilike(sql`${val}::text`, `%${filter.value}%`));
        break;
      case "startsWith":
        condition = ilike(sql`${val}::text`, `${filter.value}%`);
        break;
      case "endsWith":
        condition = ilike(sql`${val}::text`, `%${filter.value}`);
        break;
      case "greaterThan":
        condition = gt(val, filter.value);
        break;
      case "lessThan":
        condition = lt(val, filter.value);
        break;
      default:
        throw new Error("Unsupported filter");
    }

    return and(columnMatch, condition);
  });
  if (conditions.length === 0) throw new Error("Unsupported filter");

  return conditions;
};

export const andMaybe = (...conds: (SQL | undefined)[]) =>
  and(...(conds.filter(Boolean) as SQL[]));

export type RowId = {
  id: number;
};
