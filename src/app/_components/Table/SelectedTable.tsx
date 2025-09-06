import { useEffect, useState } from "react";
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
import FilterButton from "./TableComponents/buttons/FilterButton";
import SortButton from "./TableComponents/buttons/SortButton";
import HiddenButton from "./TableComponents/buttons/HiddenButton";
import SearchViewButton from "./TableComponents/buttons/SearchViewButton";
interface SelectedTableProps {
  selectedTable: TableType;
}

const SelectedTable: React.FC<SelectedTableProps> = ({ selectedTable }) => {
  const [cols, setCols] = useState<ColType[]>([]);
  const [showCols, setShownCols] = useState<ColType[]>([]);
  const [views, setViews] = useState<ViewType[] | null>(null);
  const [currentView, setCurrentView] = useState<ViewType | null>(null);
  const [search, setSearch] = useState<string | undefined>(undefined);

  const { data: loadedViews, isLoading: viewsLoading } =
    api.table.getViewByTable.useQuery(
      { tableId: selectedTable?.id ?? 0 },
      { enabled: !!selectedTable?.id },
    );
  const {
    data: loadedCols,
    isLoading: colsLoading,
    refetch: refetchCols,
  } = api.table.getColumnsByTable.useQuery(
    { tableId: selectedTable?.id ?? 0, viewId: currentView?.id ?? 0 },
    { enabled: !!selectedTable?.id && !viewsLoading && !!currentView },
  );

  const [viewConfig, setViewConfig] =
    useState<ViewConfigType>(DEFAULT_VIEW_CONFIG);

  useEffect(() => {
    if (!colsLoading && loadedCols) {
      setCols(loadedCols.cols);
      setShownCols(loadedCols.shownCols);
    }
  }, [colsLoading, loadedCols]);

  useEffect(() => {
    if (viewsLoading) return;
    if (!loadedViews) return;

    setViews(loadedViews);
    setCurrentView(loadedViews[0]!);
    setViewConfig(loadedViews[0]?.config as ViewConfigType);
  }, [viewsLoading, loadedViews]);

  const onConfigChange = async (newConfig: ViewConfigType) => {
    setCurrentView((prevData) =>
      prevData ? { ...prevData, config: newConfig } : null,
    );
    setViewConfig(newConfig);
    await refetchCols();
  };

  const isDataLoading = colsLoading || viewsLoading;

  return (
    <div className="h-full w-full overflow-hidden bg-gray-50 text-sm text-gray-700">
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
          {!isDataLoading && currentView && cols && (
            <>
              <HiddenButton
                viewId={currentView?.id}
                cols={cols}
                currHiddenCols={viewConfig.hiddenColumns}
                setConfig={setViewConfig}
                onViewChange={() => onConfigChange}
              />

              <FilterButton
                viewId={currentView?.id}
                cols={cols}
                filter={viewConfig.filters}
                setConfig={setViewConfig}
                onViewChange={() => onConfigChange}
              />
              <button className="flex items-center gap-1 hover:text-gray-900">
                <LayoutGrid className="h-4 w-4" /> Group
              </button>
              <SortButton
                viewId={currentView?.id}
                cols={cols}
                sorts={viewConfig.sorting}
                setConfig={setViewConfig}
                onViewChange={() => onConfigChange}
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
      <div className="flex h-full">
        {
          /*!viewsLoading && */ views && currentView && (
            <TableMenu
              tableId={selectedTable.id}
              views={views}
              setSelectedView={setCurrentView}
              selectedView={currentView}
            />
          )
        }
        {!isDataLoading && currentView && (
          <DataGrid
            table={selectedTable}
            searchText={search}
            cols={showCols}
            view={currentView}
            setCols={setCols}
          />
        )}
      </div>
    </div>
  );
};

export default SelectedTable;
