// app/page.tsx
"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  Menu,
  EyeOff,
  Filter,
  LayoutGrid,
  ArrowDownUp,
  Palette,
  List,
  Table,
} from "lucide-react";
import TableMenu from "./TableMenu";
import SelectedTableRows from "./SelectedTableRows";
import type { columns, rows, table } from "~/server/db/schemas/tableSchema";
import type { InferSelectModel } from "drizzle-orm";

type Table = InferSelectModel<typeof table>;
type Col = InferSelectModel<typeof columns>;
type Row = InferSelectModel<typeof rows>;

interface SelectedTableProps {
  table: Table,
  tableRows: Row[];
  tableCols: Col[]
}

const SelectedTable: React.FC<SelectedTableProps> = ({ table, tableRows, tableCols }) => {
  const [rows, setRows] = useState(tableRows);
  const [cols, setCols] = useState(tableCols);

  return (
    <div className="h-full w-full bg-gray-50 text-sm text-gray-700">
      {/* Header - Grid view and field views */}
      <div className="flex h-11 w-full items-center justify-between border-b border-gray-200 bg-white px-4 text-sm">
        {/* Left section */}
        <div className="flex items-center gap-3">
          {/* Hamburger menu */}
          <button className="rounded p-1 hover:bg-gray-100">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          {/* Current view */}
          <button className="flex items-center gap-1 rounded px-2 py-1 hover:bg-gray-100">
            <Table className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-800">Grid view</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-5 text-gray-600">
          <button className="flex items-center gap-1 hover:text-gray-900">
            <EyeOff className="h-4 w-4" />
            Hide fields
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <LayoutGrid className="h-4 w-4" />
            Group
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <ArrowDownUp className="h-4 w-4" />
            Sort
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <Palette className="h-4 w-4" />
            Color
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <List className="h-4 w-4" />
            Share and sync
          </button>

          {/* Search icon */}
          <button className="rounded p-1 hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <TableMenu />
        {/* Row cells */}
        <SelectedTableRows rows={rows} cols={cols} />
      </div>
    </div>
  );
};
export default SelectedTable;