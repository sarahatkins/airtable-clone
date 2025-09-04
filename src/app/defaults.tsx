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
  filters: FilterType[];
  hiddenColumns: HiddenColType[];
};

export type SortingType = {
  columnId: number;
  direction: "asc" | "desc";
};

export type FilterType = {
  columnId: number;
  operator: FilterOperator;
  value: string | number | boolean;
  joiner?: FilterJoiner; // default AND
};

export type HiddenColType = number;

export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan";
export type FilterJoiner = | "and" | "or"; 

// --------------------------------------------------
// ------------- CONSTS -----------------------------
// --------------------------------------------------

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

export const typeToIconMap: Record<STATUS, LucideIcon> = {
  [STATUS.SingleLine]: Baseline,
  [STATUS.MultiLine]: LetterText,
  [STATUS.Checkbox]: SquareMousePointer,
  [STATUS.Select]: CircleChevronDown,
  [STATUS.Date]: Calendar,
  [STATUS.Number]: ListEnd,
  [STATUS.User]: User,
};

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

export const DEFAULT_VIEW_CONFIG: ViewConfigType = {
  sorting: [],
  filters: [],
  hiddenColumns: [],
};
