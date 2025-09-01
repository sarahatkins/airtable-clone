import { useEffect, useState } from "react";
import {
  type TableType,
  type ColType,
  type RowType,
  type ViewType,
  type ViewConfigType,
  DEFAULT_VIEW_CONFIG,
} from "~/app/defaults";
import {
  Menu,
  Table,
  ChevronDown,
  EyeOff,
  LayoutGrid,
  ArrowDownUp,
  Palette,
  List,
  Search,
} from "lucide-react";
import TableMenu from "./TableMenu";
import { api } from "~/trpc/react";
import DataGrid from "./DataGrid";
import FilterButton from "./TableComponents/buttons/FilterButton";
import { views } from "~/server/db/schemas/tableSchema";
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

  const { data: loadedViews, isLoading: viewsLoading } =
    api.table.getViewByTable.useQuery(
      { tableId: selectedTable?.id ?? 0 },
      { enabled: !!selectedTable?.id },
    );

  const isDataLoading = colsLoading || rowsLoading || viewsLoading;
  const [rows, setRows] = useState<RowType[]>([]);
  const [cols, setCols] = useState<ColType[]>([]);
  const [views, setViews] = useState<ViewType[] | null>(null);
  const [currentView, setCurrentView] = useState<ViewType | null>(null);
  const [viewConfig, setViewConfig] =
    useState<ViewConfigType>(DEFAULT_VIEW_CONFIG);

  useEffect(() => {
    if (colsLoading) return;
    if (!loadedCols) return;

    setCols(loadedCols);
  }, [colsLoading, loadedCols]);

  useEffect(() => {
    if (rowsLoading) return;
    if (!loadedRows) return;

    setRows(loadedRows);
  }, [rowsLoading, loadedRows]);

  useEffect(() => {
    if (viewsLoading) return;
    if (!loadedViews) return;

    setViews(loadedViews);
    setCurrentView(loadedViews[0]!);
    setViewConfig(loadedViews[0]?.config as ViewConfigType);
  }, [viewsLoading, loadedViews]);

  return (
    <div className="h-full w-full overflow-hidden bg-sky-50 text-sm text-gray-700">
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
          {!isDataLoading && (
            <>
              <button className="flex items-center gap-1 hover:text-gray-900">
                <EyeOff className="h-4 w-4" /> Hide fields
              </button>
              <FilterButton
                tableId={selectedTable.id}
                cols={cols}
                filter={viewConfig.filters}
                setConfig={setViewConfig}
              />
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
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex h-full">
        {!viewsLoading && views && currentView && (
          <TableMenu
            tableId={selectedTable.id}
            views={views}
            setSelectedView={setCurrentView}
            selectedView={currentView}
          />
        )}
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
