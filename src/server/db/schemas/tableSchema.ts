// table doc
import { DEFAULT_VIEW_CONFIG } from "~/app/defaults";
import { createTable, users } from "./userSchema";

// --------------------------------------
// ---- BASE SCHEMA ---------------------
// --------------------------------------
export const bases = createTable("base", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id),
  name: d
    .varchar({ length: 255 })
    .notNull()
    .$defaultFn(() => "Untitled Base"),
  createdAt: d.timestamp("created_at", { withTimezone: true }).defaultNow(),
  deletedAt: d.timestamp("deleted_at", { withTimezone: true }),
}));

// --------------------------------------
// ----- TABLE SCHEMA -------------------
// --------------------------------------
export const table = createTable("tables", (d) => ({
  id: d.serial().notNull().primaryKey(),
  baseId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => bases.id, { onDelete: "cascade" }),
  name: d
    .varchar({ length: 255 })
    .notNull()
    .$defaultFn(() => "Table x"),
  createdAt: d.timestamp("created_at", { withTimezone: true }).defaultNow(),
}));

export const columns = createTable("columns", (d) => ({
  id: d.serial().primaryKey(),
  tableId: d
    .integer()
    .references(() => table.id, { onDelete: "cascade" })
    .notNull(),
  name: d.varchar({ length: 255 }).notNull(),
  type: d.text().notNull().default("text"),
  orderIndex: d.integer().notNull(),
}));

export const rows = createTable("rows", (d) => ({
  id: d.serial().primaryKey(),
  tableId: d.integer().references(() => table.id, {
    onDelete: "cascade",
  }),
  createdAt: d.timestamp("created_at", { withTimezone: true }).defaultNow(),
}));

export const cellValues = createTable("cell_values", (d) => ({
  id: d.serial().primaryKey(),
  tableId: d.integer().references(() => table.id, { onDelete: "cascade" }),
  rowId: d
    .integer()
    .references(() => rows.id, { onDelete: "cascade" })
    .notNull(),
  columnId: d
    .integer()
    .references(() => columns.id, {
      onDelete: "cascade",
    })
    .notNull(),
  value: d.jsonb("value").$type<string | number | null>().notNull(),
}));

export const views = createTable("views", (d) => ({
  id: d.serial().primaryKey(),
  tableId: d
    .integer()
    .references(() => table.id, {
      onDelete: "cascade",
    })
    .notNull(),
  name: d.text().notNull(),
  config: d.jsonb().notNull().default(JSON.stringify(DEFAULT_VIEW_CONFIG)),
}));
