import { useEffect, useState } from "react";
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
  Plus,
} from "lucide-react";
import TableMenu from "./TableMenu";
import { api } from "~/trpc/react";
import CreateNewColButton from "./TableComponents/CreateNewCol";
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
  const utils = api.useUtils();
  const [rows, setRows] = useState<RowType[]>([]);
  const [cols, setCols] = useState<ColType[]>(tableCols);
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const createRowMutation = api.table.createRow.useMutation({
    onSuccess: () => {
      utils.table.getRowsByTable.invalidate({ tableId: table.id });
    },
  });
  // Fetch all cell values for each row
  const rowIds = tableRows.map((r) => r.id);
  const { data: cellValues, isLoading: cellsLoading } =
    api.table.getCellsByRows.useQuery(
      { rowIds },
      { enabled: rowIds.length > 0 },
    );

  // Hydrate rows with cell values when they load
  useEffect(() => {
    if (!cellValues) return;

    const hydratedRows = tableRows.map((row) => {
      const cellsForRow = cellValues.filter((cv) => cv.rowId === row.id);
      const rowWithCells: any = { ...row };
      cellsForRow.forEach((cell) => {
        const col = tableCols.find((c) => c.id === cell.columnId);
        if (col) rowWithCells[col.name] = cell.value;
      });
      return rowWithCells;
    });

    setRows(hydratedRows);
  }, [cellValues, tableRows, tableCols]);

  // Build react-table column definitions
  const columns = cols.map((col) => ({
    accessorKey: col.name,
    header: col.name,
    size: 120,
    cell: EditableCell,
    enableColumnFilter: true,
    meta: { col }, // keep a reference to column info
  }));

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

  const addNewRow = () => {
    const newRow: RowType = {
      id: Date.now(), // temp ID for frontend
      tableId: table.id,
      createdAt: new Date(),
      ...cols.reduce((acc, col) => ({ ...acc, [col.name]: "" }), {}),
    };

    // Update frontend state
    setRows((prev) => [...prev, newRow]);

    // Persist to backend
    createRowMutation.mutate({ tableId: table.id });
  };

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
      <CreateNewColButton dbTable={table} setCols={setCols} />

      {/* Body */}
      <div className="flex h-full">
        <TableMenu />
        <SelectedTableRows
          table={reactTable}
          rows={rows}
          cols={cols}
          columnFilters={columnFilters}
          setRows={setRows}
          setCols={setCols}
          setColumnFilters={setColumnFilters}
        />
        <button
          onClick={addNewRow}
          className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
        >
          <Plus size={16} /> Add Row
        </button>
      </div>
    </div>
  );
};

export default SelectedTable;
