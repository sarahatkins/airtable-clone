import React, { useRef, useMemo, useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  CellType,
  ColType,
  RowType,
  TableType,
  ViewType,
} from "~/app/defaults";
import EditableCell from "./TableComponents/EditableCell";
import { useVirtualizer } from "@tanstack/react-virtual";
import HundredThousandButton from "./TableComponents/buttons/100kButton";
import CreateColButton from "./TableComponents/buttons/CreateColButton";
import { api } from "~/trpc/react";
import CreateRowButton from "./TableComponents/buttons/CreateRowButton";

interface DataGridProps {
  table: TableType;
  view: ViewType;
  cols: ColType[];
  setCols: React.Dispatch<React.SetStateAction<ColType[]>>;
}

interface HydratedRows extends RowType {
  cells: CellType[];
}

const ROW_HEIGHT = 41;

const DataGrid: React.FC<DataGridProps> = ({ table, view, cols, setCols }) => {
  // Fetch rows + cells for the selected view
  const parentRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);

  const [isFreshFetch, setIsFreshFetch] = useState<boolean>(false);
  const {
    data: viewData,
    refetch: refetchViewData,
    isFetching,
  } = api.table.getFilterCells.useQuery(
    { viewId: view?.id ?? 0, limit: 100, cursor },
    { enabled: !!view?.id }, //doesn't run until view provided
  );

  const reactColumns = useMemo(
    () =>
      cols.map((col) => ({
        accessorKey: `col_${col.id}`,
        header: col.name,
        size: 200,
        cell: EditableCell,
        enableColumnFilter: true,
        meta: { col },
      })),
    [cols],
  );

  const reactTable = useReactTable({
    data: rows,
    columns: reactColumns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });

  // Row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const totalWidth = useMemo(
    () => reactColumns.reduce((sum, c) => sum + (c.size ?? 150) + 150, 0),
    [table],
  );

  useEffect(() => {
    if (!viewData) return;

    const { rows: newRows, nextCursor } = viewData;
    const normalized = normalizeRows(newRows);

    // append if we already have rows, otherwise replace
    setRows((prev) => (cursor ? [...prev, ...normalized] : normalized));

    setNextCursor(nextCursor ?? undefined);
  }, [viewData]);

  const loadMoreRows = () => {
    if (nextCursor && !isFetching) {
      setCursor(nextCursor);
    }
  };

  const normalizeRows = (rowsWithCells: any[]) => {
    console.log(rowsWithCells);
    return rowsWithCells.map((row) => {
      const rowObj: Record<string, any> = {
        id: row.id,
        tableId: row.tableId,
      };
      for (const cell of row.cells) {
        rowObj[`col_${cell.columnId}`] = cell.value;
      }
      return rowObj;
    });
  };

  useEffect(() => {
    setRows([]);
    setIsFreshFetch(true);
    setCursor(undefined); // trigger a fresh fetch with no cursor
  }, [view]);

  useEffect(() => {
    const lastVisible = rowVirtualizer.getVirtualItems().slice(-1)[0];
    if (!lastVisible) return;

    // don’t auto-fetch if fewer rows than one page
    if (rows.length < 50) return;

    if (lastVisible.index >= rows.length - 100) {
      loadMoreRows();
    }
  }, [rowVirtualizer.getVirtualItems(), rows.length, cursor]);

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
                <CreateRowButton
                  cols={cols}
                  dbTable={table}
                  setRows={setRows}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
