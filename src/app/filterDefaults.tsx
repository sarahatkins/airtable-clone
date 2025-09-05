export type FilterGroup = {
  functionName: "and" | "or";
  args: FilterLeaf[];
};

export type FilterLeaf = {
  functionName: FilterOperator2;
  args: [columnId: number, value: string | number | boolean];
};

export type FilterOperator2 =
  | "eq"
  | "neq"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "lt"
  | "gte"
  | "lte";
