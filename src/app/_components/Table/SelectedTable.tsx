import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { TableType, ColType, RowType } from "~/app/defaults";
import SelectedTableRows from "./SelectedTableRows";
import EditableCell from "./TableComponents/EditableCell";
import {
  Menu,
  Table,
  ChevronDown,
  EyeOff,
  Filter,
  LayoutGrid,
  ArrowDownUp,
  Palette,
  List,
  Search,
} from "lucide-react";
import TableMenu from "./TableMenu";

interface SelectedTableProps {
  table: TableType;
  tableRows: RowType[];
  tableCols: ColType[];
}

const SelectedTable: React.FC<SelectedTableProps> = ({
  table,
  tableRows,
  tableCols,
}) => {
  const [rows, setRows] = useState<RowType[]>(tableRows);
  const [cols, setCols] = useState<ColType[]>(tableCols);
  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  // Build columns from ColType[]
  const columns = cols.map((col) => ({
    accessorKey: col.name,
    header: col.name,
    size: 120,
    cell: EditableCell,
    enableColumnFilter: true,
  }));

  // React Table instance
  const reactTable = useReactTable({
    data: rows,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) =>
        setRows((prev) =>
          prev.map((row, idx) =>
            idx === rowIndex ? { ...row, [columnId]: value } : row,
          ),
        ),
    },
  });

  return (
    <div className="h-full w-full bg-gray-50 text-sm text-gray-700">
      {/* Header - Grid view and field views */}
      <div className="flex h-11 w-full items-center justify-between border-b border-gray-200 bg-white px-4 text-sm">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button className="rounded p-1 hover:bg-gray-100">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <button className="flex items-center gap-1 rounded px-2 py-1 hover:bg-gray-100">
            <Table className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-800">Grid view</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-5 text-gray-600">
          <button className="flex items-center gap-1 hover:text-gray-900">
            <EyeOff className="h-4 w-4" /> Hide fields
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <LayoutGrid className="h-4 w-4" /> Group
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <ArrowDownUp className="h-4 w-4" /> Sort
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <Palette className="h-4 w-4" /> Color
          </button>
          <button className="flex items-center gap-1 hover:text-gray-900">
            <List className="h-4 w-4" /> Share and sync
          </button>
          <button className="rounded p-1 hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex h-full">
        <TableMenu />
        <SelectedTableRows
          table={reactTable}
          rows={rows}
          cols={cols}
          setColumnFilters={setColumnFilters}
          columnFilters={columnFilters}
        />
      </div>
    </div>
  );
};

export default SelectedTable;
