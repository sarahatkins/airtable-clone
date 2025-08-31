import { useEffect, useState } from "react";
import type { TableType, ColType, RowType } from "~/app/defaults";
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
import { api } from "~/trpc/react";
import DataGrid from "./DataGrid";
interface SelectedTableProps {
  selectedTable: TableType;
}

const SelectedTable: React.FC<SelectedTableProps> = ({ selectedTable }) => {
  const { data: loadedCols, isLoading: colsLoading } =
    api.table.getColumnsByTable.useQuery(
      { tableId: selectedTable?.id ?? 0 },
      { enabled: !!selectedTable?.id },
    );
  const { data: loadedRows, isLoading: rowsLoading } =
    api.table.getRowsByTable.useQuery(
      { tableId: selectedTable?.id ?? 0 },
      { enabled: !!selectedTable?.id },
    );

  const isDataLoading = colsLoading || rowsLoading;
  const [rows, setRows] = useState<RowType[]>([]);
  const [cols, setCols] = useState<ColType[]>([]);

  useEffect(() => {
    if (colsLoading) return; // still loading? wait
    if (!loadedCols) return; // no data? don't update
    setCols(loadedCols);
  }, [colsLoading, loadedCols]);

  useEffect(() => {
    if (rowsLoading) return; // still loading? wait
    if (!loadedRows) return; // no data? don't update
    setRows(loadedRows);
  }, [rowsLoading, loadedRows]);

  return (
    <div className="overflow-hidden h-full w-full bg-sky-50 text-sm text-gray-700">
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
        {!isDataLoading && (
          <DataGrid
            table={selectedTable}
            rows={rows}
            cols={cols}
            setRows={setRows}
            setCols={setCols}
          />
        )}
        
      </div>
    </div>
  );
};

export default SelectedTable;
