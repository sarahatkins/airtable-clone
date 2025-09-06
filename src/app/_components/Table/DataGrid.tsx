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

const DataGrid: React.FC<DataGridProps> = ({
  table,
  view,
  cols,
  setCols,
  searchText,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState<NormalizedRow[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);
  const [isFreshFetch, setIsFreshFetch] = useState<boolean>(false);
  
  const { data: viewData, isFetching } = api.table.getFilterCells.useQuery(
    { viewId: view?.id ?? 0, limit: 100, cursor, searchText },
    { enabled: !!view?.id },
  ) as UseQueryResult<ViewDataResult>;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const reactColumns = cols.map((col) => ({
    accessorKey: `col_${col.id}`,
    header: col.name,
    size: 200,
    enableColumnFilter: true,
    meta: { col },
    cell: EditableCell,
  }));

  const reactTable = useReactTable({
    data: rows,
    columns: reactColumns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
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
    () => reactColumns.reduce((sum, c) => sum + (c.size ?? 150) + 150, 0),
    [reactColumns],
  );

  const normalizeRows = useCallback(
    (rowsWithCells: HydratedRows[]): NormalizedRow[] => {
      return rowsWithCells.map((row) => {
        const rowObj: NormalizedRow = {
          id: row.id,
          tableId: table.id,
        };
        for (const cell of row.cells) {
          rowObj[`col_${cell.columnId}`] = cell.value;
        }
        return rowObj;
      });
    },
    [table.id],
  );

  useEffect(() => {
    if (!viewData) return;

    const { rows: newRows, nextCursor } = viewData;
    const normalized = normalizeRows(newRows);

    // always replace rows on fresh fetch
    setRows((prev) => (isFreshFetch ? normalized : [...prev, ...normalized]));

    setNextCursor(nextCursor ?? undefined);

    // After first fetch, set isFreshFetch = false
    if (isFreshFetch) setIsFreshFetch(false);
  }, [viewData, isFreshFetch, normalizeRows]);

  const loadMoreRows = useCallback(() => {
    if (nextCursor && !isFetching) {
      setCursor(nextCursor);
    }
  }, [nextCursor, isFetching]);

  useEffect(() => {
    if (!view) return;

    setRows([]);
    setIsFreshFetch(true);
    setCursor(undefined); // trigger a fresh fetch with no cursor
    setNextCursor(undefined);
  }, [view, searchText]);

  useEffect(() => {
    const lastVisible = rowVirtualizer.getVirtualItems().slice(-1)[0];
    if (!lastVisible) return;

    if (lastVisible.index >= rows.length - 100) {
      setIsFreshFetch(false);
      loadMoreRows();
    }
  }, [rowVirtualizer, virtualItems, rows.length, loadMoreRows]);

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Toolbar + sticky header wrapper (sticky keeps header visible while vertical-scrolling) */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-transparent">
        <div className="flex items-center gap-2 px-2 py-2">
          <HundredThousandButton tableId={table.id} />
          <div className="text-xs text-gray-500">
            {rows.length.toLocaleString()} rows
          </div>
        </div>

        {/* Header: put it in an overflow-x container so it scrolls horizontally with the body */}
        <div className="overflow-auto">
          <div style={{ width: Math.max(totalWidth + 200, 800) }}>
            {reactTable.getHeaderGroups().map((hg) => (
              <div
                key={hg.id}
                className="flex border-t border-b border-gray-200"
              >
                {hg.headers.map((header) => (
                  <div
                    key={header.id}
                    className="border-r border-gray-200 bg-white px-3 py-2 text-sm font-semibold"
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </div>
                ))}

                {/* Extra header cell at the end */}
                <div
                  key="column_add"
                  className="flex cursor-pointer items-center justify-center border-r border-gray-200 bg-white hover:bg-neutral-50"
                  style={{ minWidth: "120px" }} // give it some space
                >
                  <CreateColButton dbTable={table} setCols={setCols} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body: one scroll container for both directions */}
      <div ref={parentRef} className="relative flex-1 overflow-auto bg-white">
        {/* Inner spacer must be as wide as the total table to enable horizontal scroll */}
        <div
          className="relative"
          style={{
            height: rowVirtualizer.getTotalSize(),
          }}
        >
          {rowVirtualizer.getVirtualItems().map((vr) => {
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
                <CreateRowButton dbTable={table} setRows={setRows} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
