import { SQL, sql } from "drizzle-orm";
import type { FilterGroup, FilterLeaf } from "~/app/defaults";
import { cellValues, rows } from "~/server/db/schemas/tableSchema";

export function buildFilter(node: FilterGroup | FilterLeaf): SQL {
  // Check if it's a branch/group node
  if (node.functionName === "and" || node.functionName === "or") {
    const op = node.functionName.toUpperCase();
    const subFilters = (node.args as FilterLeaf[])
      .map((arg) => buildFilter(arg))
      .filter(Boolean);

    if (subFilters.length === 0) {
      throw new Error(`Empty ${op} filter group`);
    }

    return sql`(${sql.join(subFilters, sql.raw(` ${op} `))})`;
  }

  // Must be a leaf node at this point
  if (node.args.length === 2) {
    const [columnId, value] = node.args as [number, string | number | boolean];

    switch (node.functionName) {
      case "eq":
        return sql`EXISTS (
          SELECT 1 FROM ${cellValues} cv
          WHERE cv."rowId" = ${rows.id}
            AND cv."columnId" = ${columnId}
            AND cv."value"::jsonb = to_jsonb(${value}::text)
        )`;
      case "neq":
        return sql`EXISTS (
          SELECT 1 FROM ${cellValues} cv
          WHERE cv."rowId" = ${rows.id}
            AND cv."columnId" = ${columnId}
            AND cv."value"::jsonb != to_jsonb(${value}::text)
        )`;
      case "contains":
        return sql`EXISTS (
        SELECT 1 FROM ${cellValues} cv
        WHERE cv."rowId" = ${rows.id}
          AND cv."columnId" = ${columnId}
          AND cv."value"::text ILIKE '%' || ${value} || '%'
      )`;
      case "notContains":
        return sql`EXISTS (
          SELECT 1 FROM ${cellValues} cv
          WHERE cv."rowId" = ${rows.id}
            AND cv."columnId" = ${columnId}
            AND NOT (cv."value"::text ILIKE '%' || ${value} || '%')
        )`;
      case "isEmpty":
        return sql`EXISTS (
        SELECT 1 FROM "airtable_cell_values" cv
        WHERE cv."rowId" = ${rows.id}
          AND cv."columnId" = ${columnId}
          AND (
            cv."value" IS NULL
            OR cv."value"::jsonb = to_jsonb(''::text)
          )
      )
      `;
      case "isNotEmpty":
        return sql`EXISTS (
        SELECT 1 FROM ${cellValues} cv
        WHERE cv."rowId" = ${rows.id}
          AND cv."columnId" = ${columnId}
          AND cv."value" IS NOT NULL
          AND cv."value"::jsonb != to_jsonb(''::text)
      )`;
      case "gt":
        return sql`EXISTS (
          SELECT 1 FROM ${cellValues} cv
          WHERE cv."rowId" = ${rows.id}
            AND cv."columnId" = ${columnId}
            AND (cv."value" #>> '{}')::numeric > ${value}
        )`;

      case "lt":
        return sql`EXISTS (
          SELECT 1 FROM ${cellValues} cv
          WHERE cv."rowId" = ${rows.id}
            AND cv."columnId" = ${columnId}
            AND (cv."value" #>> '{}')::numeric < ${value}
        )`;

      case "gte":
        return sql`EXISTS (
          SELECT 1 FROM ${cellValues} cv
          WHERE cv."rowId" = ${rows.id}
            AND cv."columnId" = ${columnId}
            AND (cv."value" #>> '{}')::numeric >= ${value}
        )`;
      case "lte":
        return sql`EXISTS (
          SELECT 1 FROM ${cellValues} cv
          WHERE cv."rowId" = ${rows.id}
            AND cv."columnId" = ${columnId}
            AND (cv."value" #>> '{}')::numeric <= ${value}
        )`;
      default:
        throw new Error(`Unknown operator: ${node.functionName}`);
    }
  }

  throw new Error("Invalid filter node: expected either a group or a leaf");
}

export function validateFilterGroup(group: FilterGroup): asserts group is FilterGroup {
  if (!group.functionName || !["and", "or"].includes(group.functionName)) {
    throw new Error("Top-level filter must be 'and' or 'or'");
  }
  if (!Array.isArray(group.args) || group.args.length === 0) {
    throw new Error("Filter group must have at least one filter");
  }

  for (const leaf of group.args) {
    if (
      typeof leaf !== "object" ||
      !leaf.functionName ||
      !Array.isArray(leaf.args) ||
      leaf.args.length !== 2
    ) {
      throw new Error("Invalid filter leaf");
    }
  }
}
