import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  CellType,
  CellValue,
  ColType,
  RowType,
  TableType,
  ViewType,
} from "~/app/defaults";
import EditableCell from "./EditableCell";
import { useVirtualizer } from "@tanstack/react-virtual";
import HundredThousandButton from "./buttons/100kButton";
import CreateColButton from "./buttons/CreateColButton";
import { api } from "~/trpc/react";
import CreateRowButton from "./buttons/CreateRowButton";
import type { UseQueryResult } from "@tanstack/react-query";

interface DataGridProps {
  table: TableType;
  view: ViewType;
  cols: ColType[];
  searchText: string | undefined;
  setCols: React.Dispatch<React.SetStateAction<ColType[]>>;
}

interface HydratedRows {
  id: number;
  cells: CellType[];
}

const ROW_HEIGHT = 41;

export type NormalizedRow = {
  id: number;
  tableId: number;
} & Record<string, CellValue>;

type ViewDataResult = {
  rows: HydratedRows[];
  nextCursor: number | null;
};
export type CellCoord = { row: number; col: number };

const DataGrid: React.FC<DataGridProps> = ({
  table,
  view,
  cols,
  setCols,
  searchText,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [rows, setRows] = useState<NormalizedRow[]>([]);

  const {
    data: viewData,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = api.table.getFilterCells.useInfiniteQuery(
    {
      viewId: view?.id ?? 0,
      limit: 100,
      searchText,
    },
    {
      enabled: !!view?.id,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.nextCursor ?? undefined;
      },
    },
  );

  useEffect(() => {
    if (!viewData?.pages) return;

    const normalized = viewData.pages.flatMap((page) =>
      page.rows.map((row) => {
        const rowObj: NormalizedRow = {
          id: row.id,
          tableId: table.id,
        };
        for (const cell of row.cells) {
          rowObj[`col_${cell.columnId}`] = cell.value;
        }
        return rowObj;
      }),
    );

    setRows(normalized);
  }, [viewData, table.id]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => scrollRef.current,
  });

  const virtualItems = virtualizer.getVirtualItems();
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!hasNextPage || isFetchingNextPage || !lastItem) return;
    if (lastItem.index >= rows.length - 1) {
      fetchNextPage();
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage]);

  const reactColumns = cols.map((col) => ({
    accessorKey: `col_${col.id}`,
    header: col.name,
    size: 150,
    enableColumnFilter: true,
    meta: { col },
    cell: EditableCell,
  }));

  const reactTable = useReactTable({
    data: rows,
    columns: reactColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    meta: {
      updateData: (rowIndex: number, columnId: string, value: CellValue) => {
        setRows((prev) =>
          prev.map((row, idx) =>
            idx === rowIndex ? { ...row, [columnId]: value } : row,
          ),
        );
      },
    },
  });

  const totalWidth = useMemo(
    () => reactColumns.reduce((sum, c) => sum + (c.size ?? 150) + 50, 0),
    [reactColumns],
  );
  return (
    <div ref={scrollRef} className="flex h-full w-full flex-col">
      <div ref={scrollRef} className="overflow-auto" style={{ height: "100%" }}>
        <div style={{ width: Math.max(totalWidth + 200, 800) }}>
          {/* Header */}
          {reactTable.getHeaderGroups().map((hg) => (
            <div key={hg.id} className="flex border-t border-b border-gray-200">
              {hg.headers.map((header) => (
                <div
                  key={header.id}
                  className="border-r border-gray-200 bg-white px-3 py-2 text-sm font-semibold"
                  style={{ width: header.getSize() }}
                >
                  <>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {/* {header.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()} // Attach resize handler
                        onTouchStart={header.getResizeHandler()}
                        className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                      />
                    )} */}
                  </>
                </div>
              ))}
              <div
                key="column_add"
                className="flex cursor-pointer items-center justify-center border-r border-gray-200 bg-white hover:bg-neutral-50"
                style={{ minWidth: "120px" }}
              >
                <CreateColButton dbTable={table} setCols={setCols} />
              </div>
            </div>
          ))}

          {/* Body (virtualized rows) */}
          <div
            className="relative"
            style={{
              height: virtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((vr) => {
              const r = reactTable.getRowModel().rows[vr.index];
              if (!r) return null;
              return (
                <div
                  key={vr.key}
                  className="absolute top-0 left-0 flex items-center border-b border-gray-200 hover:bg-neutral-50"
                  style={{
                    height: `${vr.size}px`,
                    transform: `translateY(${vr.start}px)`,
                  }}
                  data-index={vr.index}
                >
                  {r.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="overflow-hidden border-r border-gray-200 text-ellipsis whitespace-nowrap"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <CreateRowButton dbTable={table} setRows={setRows} />
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
