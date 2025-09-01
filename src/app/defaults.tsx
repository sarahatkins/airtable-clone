import type { InferSelectModel } from "drizzle-orm";
import type {
  cellValues,
  columns,
  rows,
  table,
  views,
} from "~/server/db/schemas/tableSchema";

export type TableType = InferSelectModel<typeof table>;
export type ColType = InferSelectModel<typeof columns>;
export type RowType = InferSelectModel<typeof rows>;
export type CellType = InferSelectModel<typeof cellValues>;
export type ViewType = InferSelectModel<typeof views>;

export const DEFAULT_PENDING_KEY = -1;

export enum STATUS {
  SingleLine = "single_line",
  MultiLine = "multi_line",
  Checkbox = "checkbox",
  Select = "select",
  Date = "date",
  Number = "number",
  User = "user",
}

export const DEFAULT_NUM_ROWS = 3;

export const DEFAULT_COLS = [
  {
    name: "Name",
    type: STATUS.SingleLine,
    primary: true,
  },
  {
    name: "Notes",
    type: STATUS.MultiLine,
  },
  {
    name: "Assignee",
    type: STATUS.User,
  },
  {
    name: "Status",
    type: STATUS.Select,
  },
];
