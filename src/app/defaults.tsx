import type { InferSelectModel } from "drizzle-orm";
import { Baseline, LetterText, CircleChevronDown, ListEnd, User, Calendar, SquareMousePointer, type LucideIcon } from "lucide-react";
import type {
  cellValues,
  columns,
  rows,
  table,
  views,
} from "~/server/db/schemas/tableSchema";

// --------------------------------------------------
// ------------- TYPES ------------------------------
// --------------------------------------------------

export type TableType = InferSelectModel<typeof table>;
export type ColType = InferSelectModel<typeof columns>;
export type RowType = InferSelectModel<typeof rows>;
export type CellType = InferSelectModel<typeof cellValues>;
export type CellNoId = Omit<CellType, "id">;
export type ViewType = InferSelectModel<typeof views>;
export type ViewConfigType = {
  sorting: SortingType[];
  filters: FilterGroup | null;
  hiddenColumns: HiddenColType[];
};

export type SortingType = {
  columnId: number;
  direction: "asc" | "desc";
};

export type FilterGroup = {
  functionName: "and" | "or";
  args: FilterLeaf[];
};

export type FilterLeaf = {
  functionName: FilterOperator;
  args: [columnId: number, value: string | number | boolean];
};

export type FilterOperator =
  | "eq"
  | "neq"
  | "contains"
  | "notContains"
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

export const DEFAULT_PENDING_KEY = -1;

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
    type: STATUS.Text,
  },
];

export const DEFAULT_VIEW_CONFIG: ViewConfigType = {
  sorting: [],
  filters: null,
  hiddenColumns: [],
};
