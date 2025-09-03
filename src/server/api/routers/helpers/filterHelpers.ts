import { eq, ne, ilike, notIlike, gt, lt, SQL } from "drizzle-orm";
import type { FilterOperator } from "~/app/defaults";

export const operatorMap: Record<
  FilterOperator,
  (col: any, val: any) => SQL
> = {
  equals: (col, val) => eq(col, val),
  notEquals: (col, val) => ne(col, val),
  contains: (col, val) => ilike(col, `%${val}%`),
  notContains: (col, val) => notIlike(col, `%${val}%`),
  startsWith: (col, val) => ilike(col, `${val}%`),
  endsWith: (col, val) => ilike(col, `%${val}`),
  greaterThan: (col, val) => gt(col, val),
  lessThan: (col, val) => lt(col, val),
};
