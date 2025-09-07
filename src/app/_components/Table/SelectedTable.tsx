import { useEffect, useMemo, useState } from "react";
import {
  type TableType,
  type ColType,
  type ViewType,
  type ViewConfigType,
  DEFAULT_VIEW_CONFIG,
} from "~/app/defaults";
import {
  Menu,
  Table,
  ChevronDown,
  LayoutGrid,
  Palette,
  List,
} from "lucide-react";
import TableMenu from "./TableMenu";
import { api } from "~/trpc/react";
import DataGrid from "./DataGrid";
import FilterButton from "./buttons/FilterButton";
import SortButton from "./buttons/SortButton";
import HiddenButton from "./buttons/HiddenButton";
import SearchViewButton from "./buttons/SearchViewButton";
import LoadingScreen from "./LoadingScreen";
interface SelectedTableProps {
  selectedTable: TableType;
}

const SelectedTable: React.FC<SelectedTableProps> = ({ selectedTable }) => {
  const utils = api.useUtils();

  const [currentView, setCurrentView] = useState<ViewType | null>(null);
  const [viewConfig, setViewConfig] =
    useState<ViewConfigType>(DEFAULT_VIEW_CONFIG);

  const [cols, setCols] = useState<ColType[]>([]);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const { data: numRows } = api.table.getNumRows.useQuery(
    { tableId: selectedTable?.id ?? 0 },
    { enabled: !!selectedTable?.id },
  );
  const { data: loadedViews, isLoading: viewsLoading } =
    api.table.getViewByTable.useQuery(
      { tableId: selectedTable?.id ?? 0 },
      { enabled: !!selectedTable?.id },
    );

  // Load all columns for the table (no viewId needed)
  const { data: loadedCols, isLoading: colsLoading } =
    api.table.getColumnsByTable.useQuery(
      { tableId: selectedTable?.id ?? 0 },
      { enabled: !!selectedTable?.id },
    );

  const views = loadedViews ?? [];

  const shownCols = useMemo(() => {
    return cols.filter((c) => !viewConfig.hiddenColumns.includes(c.id));
  }, [cols, viewConfig.hiddenColumns]);

  useEffect(() => {
    if (views?.[0] && !currentView) {
      setCurrentView(views[0]);
      setViewConfig(views[0]?.config as ViewConfigType);
    }
  }, [views, currentView]);

  const updateConfig = api.table.updateViewConfig.useMutation({
    onSuccess: async (newConfig) => {
      console.log("View Config has been updated...", newConfig);
      await utils.table.getFilterCells.invalidate();
    },
  });

  useEffect(() => {
    if (!colsLoading && loadedCols) {
      setCols(loadedCols.cols);
    }
  }, [colsLoading, loadedCols]);

  const onConfigChange = (newConfig: ViewConfigType) => {
    if (!currentView) return;

    setCurrentView({ ...currentView, config: newConfig });
    setViewConfig(newConfig);

    updateConfig.mutate({
      viewId: currentView.id,
      config: {
        filters: newConfig.filters ?? undefined,
        sorting: newConfig.sorting,
        hiddenColumns: newConfig.hiddenColumns,
      },
    });
  };
  const isDataLoading = colsLoading || viewsLoading;

  return (
    <div className="h-full overflow-hidden bg-slate-50 text-sm text-gray-700">
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
          {isDataLoading && <LoadingScreen />}
          {!isDataLoading && currentView && cols && (
            <>
              <HiddenButton
                cols={cols}
                currHiddenCols={viewConfig.hiddenColumns}
                onConfigChange={onConfigChange}
                viewConfig={viewConfig}
              />

              <FilterButton
                cols={cols}
                currFilter={viewConfig.filters}
                viewConfig={viewConfig}
                onConfigChange={onConfigChange}
              />
              <button className="flex items-center gap-1 hover:text-gray-900">
                <LayoutGrid className="h-4 w-4" /> Group
              </button>
              <SortButton
                cols={cols}
                currSorts={viewConfig.sorting ?? []}
                viewConfig={viewConfig}
                onConfigChange={onConfigChange}
              />
              <button className="flex items-center gap-1 hover:text-gray-900">
                <Palette className="h-4 w-4" /> Color
              </button>
              <button className="flex items-center gap-1 hover:text-gray-900">
                <List className="h-4 w-4" /> Share and sync
              </button>
              <SearchViewButton search={search} setSearch={setSearch} />
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex h-full min-h-0 w-full">
        {views && currentView && (
          <TableMenu
            tableId={selectedTable.id}
            views={views}
            setSelectedView={setCurrentView}
            selectedView={currentView}
          />
        )}

        <div className="min-h-0 w-full" style={{ height: "88%" }}>
          {!views.length || !currentView ? (
            <div>
              <LoadingScreen />
            </div>
          ) : (
            <>
              <DataGrid
                key={currentView.id}
                table={selectedTable}
                view={currentView}
                cols={shownCols}
                searchText={search}
                setCols={setCols}
              />
              <div className="flex h-10 bg-white border-t border-gray-100 pt-2 pl-2 text-xs">{numRows?.count} records</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedTable;
