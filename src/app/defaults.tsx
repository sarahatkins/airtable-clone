import type { InferSelectModel } from "drizzle-orm";
import { Baseline, CircleChevronDown, type LucideIcon } from "lucide-react";
import type {
  cellValues,
  columns,
  rows,
  table,
  views,
  bases,
} from "~/server/db/schemas/tableSchema";

// --------------------------------------------------
// ------------- TYPES ------------------------------
// --------------------------------------------------

export type BaseType = InferSelectModel<typeof bases>;
export type TableType = InferSelectModel<typeof table>;
export type ColType = InferSelectModel<typeof columns>;
export type ColNoId = Omit<ColType, "id">;


export type RowType = InferSelectModel<typeof rows>;
export type RowNoId = Omit<RowType, "id">;

export type CellType = InferSelectModel<typeof cellValues>;
export type CellNoId = Omit<CellType, "id">;
export type CellValue = string | number | null;

export type ViewType = InferSelectModel<typeof views>;
export type ViewConfigType = {
  sorting: SortingType[];
  filters: FilterGroup | null;
  hiddenColumns: HiddenColType[];
};

export type SortingType = {
  columnId: number;
  direction: "asc" | "desc";
  type: "text" | "number";
};

export type FilterGroup = {
  functionName: "and" | "or";
  args: FilterLeaf[];
};

export type FilterLeaf = {
  functionName: FilterOperator;
  args: [columnId: number, value: CellValue ];
};

export type FilterOperator =
  | "eq"
  | "neq"
  | "contains"
  | "notContains"
  | "is"
  | "isNot"
  | "isEmpty"
  | "isNotEmpty"
  | "gt"
  | "lt"
  | "gte"
  | "lte";
export type HiddenColType = number;

export type FilterJoiner = | "and" | "or"; 

// --------------------------------------------------
// ------------- CONSTS -----------------------------
// --------------------------------------------------

export const DEFAULT_PENDING_KEY = () => -1 * Math.floor(Math.random() * 10000);

export enum STATUS {
  Text = "text",
  Number = "number",
}

export const typeToIconMap: Record<STATUS, LucideIcon> = {
  [STATUS.Text]: Baseline,
  [STATUS.Number]: CircleChevronDown,
};

export const DEFAULT_NUM_ROWS = 3;

export const DEFAULT_COLS = [
  {
    name: "Name",
    type: STATUS.Text,
    primary: true,
  },
  {
    name: "Notes",
    type: STATUS.Text,
  },
  {
    name: "Assignee",
    type: STATUS.Text,
  },
  {
    name: "Status",
    type: STATUS.Number,
  },
];

export const DEFAULT_VIEW_CONFIG: ViewConfigType = {
  sorting: [],
  filters: null,
  hiddenColumns: [],
};
