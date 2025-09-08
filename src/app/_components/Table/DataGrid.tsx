import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  type Dispatch,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";
import type { CellValue, ColType, TableType, ViewType } from "~/app/defaults";
import EditableCell from "./EditableCell";
import { useVirtualizer } from "@tanstack/react-virtual";
import CreateColButton from "./buttons/CreateColButton";
import { api } from "~/trpc/react";
import CreateRowButton from "./buttons/CreateRowButton";
import FloatingAddRows from "./buttons/FloatingAddRows";
import ColumnHeader from "./buttons/ColumnHeader";
import IndexCell from "./buttons/IndexCell";
import RowModal from "./modals/RowModal";

interface DataGridProps {
  table: TableType;
  view: ViewType;
  cols: ColType[];
  searchText: string | undefined;
  setCols: Dispatch<React.SetStateAction<ColType[]>>;
}

const ROW_HEIGHT = 30;

export type NormalizedRow = {
  id: number;
  tableId: number;
} & Record<string, CellValue>;

export type CellCoord = { row: number; col: number };

const DataGrid: React.FC<DataGridProps> = ({
  table,
  view,
  cols,
  setCols,
  searchText,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<NormalizedRow[]>([]);

  const [focusedCell, setFocusedCell] = useState<CellCoord | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [rightClickedRowId, setRightClickedRowId] = useState<string | null>(
    null,
  );
  const [rowSelection, setRowSelection] = useState<number[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    rowId: string;
  } | null>(null);

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
      getNextPageParam: (lastPage) => {
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

  const indexColumn: ColumnDef<NormalizedRow, unknown> = {
    accessorKey: "__rowIndex",
    header: ({ table }: { table: Table<NormalizedRow> }) => (
      <input
        type="checkbox"
        checked={rowSelection.length === rows.length}
        onChange={(e) => {
          if (e.target.checked) {
            setRowSelection(rows.map((r) => r.id));
          } else {
            setRowSelection([]);
          }
        }}
      />
    ),
    size: 60,
    enableColumnFilter: false,
    meta: {
      col: {
        id: -1,
        name: "Index",
        type: "index",
        tableId: table.id,
        orderIndex: -1,
        primary: null,
      },
      colIndex: -1,
    },
    cell: ({ row }) => (
      <IndexCell
        key={row.index}
        row={row}
        hoveredRowId={hoveredRowId}
        rightClickedRowId={rightClickedRowId}
        setHoveredRowId={setHoveredRowId}
        setRightClickedRowId={setRightClickedRowId}
        setSelectedRows={setRowSelection}
        selectedRows={rowSelection}
      />
    ),
  };

  const reactColumns: ColumnDef<NormalizedRow, CellValue>[] = [
    indexColumn,
    ...cols.map((col, colIdx) => ({
      accessorKey: `col_${col.id}`,
      header: () => (
        <ColumnHeader title={col.name} colId={col.id} tableId={table.id} />
      ),
      size: 200,
      enableColumnFilter: true,
      meta: { col, colIndex: colIdx },
      cell: EditableCell,
    })),
  ];

  const reactTable = useReactTable({
    data: rows,
    columns: reactColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onEnd",
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    meta: {
      updateData: (rowIndex: number, columnId: string, value: CellValue) => {
        setRows((prev) =>
          prev.map((row, idx) =>
            idx === rowIndex ? { ...row, [columnId]: value } : row,
          ),
        );
      },
      focusedCell,
      setFocusedCell,
    },
  });

  const contentWidth = useMemo(
    () => reactColumns.reduce((sum, c) => sum + (c.size ?? 150), 0),
    [reactColumns],
  );

  // Total width including buffer for scrolling
  const totalWidth = useMemo(
    () => reactColumns.reduce((sum, c) => sum + (c.size ?? 150) + 50, 0),
    [reactColumns],
  );
  return (
    <div className="flex h-full w-full flex-col">
      <div
        ref={scrollRef}
        className="scrollbar-hidden overflow-auto"
        style={{ height: "100%" }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (!focusedCell) return;

          const maxRows = rows.length;
          const maxCols = cols.length;

          const next = { ...focusedCell };

          switch (e.key) {
            case "ArrowRight":
              if (next.col < maxCols - 1) next.col += 1;
              break;
            case "ArrowLeft":
              if (next.col > 0) next.col -= 1;
              break;
            case "ArrowDown":
              if (next.row < maxRows - 1) next.row += 1;
              break;
            case "ArrowUp":
              if (next.row > 0) next.row -= 1;
              break;
            default:
              return;
          }

          e.preventDefault();
          setFocusedCell(next);
          virtualizer.scrollToIndex(next.row); // ensure visible
        }}
      >
        {/* LONG LINE */}
        {/* <div className="absolute left-136 top-31 bottom-8.5 w-px bg-gray-400 z-10" /> */}
        <div style={{ width: Math.max(totalWidth + 200, 800) }}>
          {/* Header */}
          {reactTable.getHeaderGroups().map((hg) => (
            <div
              key={hg.id}
              className="flex border-t border-gray-200 bg-gray-50"
            >
              {hg.headers.map((header) => (
                <div
                  key={header.id}
                  className={`border-b border-gray-200 bg-white px-3 py-1 text-sm font-semibold ${
                    header.column.id !== "__rowIndex"
                      ? "border-r"
                      : "flex justify-center"
                  }`}
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
                className="flex cursor-pointer items-center justify-center border-r border-b border-gray-200 bg-white hover:bg-neutral-50"
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
              if (!r || !rows.includes(r.original)) return null;

              const selectedRow = rowSelection.includes(r.original.id);
              return (
                <div key={vr.key}>
                  <div
                    className={`absolute top-0 left-0 flex items-center border-b border-gray-200 ${selectedRow ? "bg-blue-50" : "bg-white"} hover:bg-neutral-50`}
                    style={{
                      height: `${vr.size}px`,
                      transform: `translateY(${vr.start}px)`,
                    }}
                    data-index={vr.index}
                    onContextMenu={(e) => {
                      e.preventDefault;
                      setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        rowId: r.id,
                      });
                    }}
                  >
                    {r.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        className={`overflow-hidden text-ellipsis whitespace-nowrap ${
                          cell.column.id !== "__rowIndex" &&
                          "border-r border-gray-200"
                        }`}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    ))}
                  </div>
                  <RowModal
                    x={contextMenu?.x ?? 0}
                    y={contextMenu?.y ?? 0}
                    isOpen={contextMenu != null}
                    onClose={() => setContextMenu(null)}
                    setRows={setRows}
                    selectedRows={rowSelection}
                    setRowSelection={setRowSelection}
                    rowId={Number(r.original.rowId) ?? 0}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ width: contentWidth }}>
            <CreateRowButton dbTable={table} setRows={setRows} />
          </div>
        </div>
      </div>
      <FloatingAddRows dbTable={table} setRows={setRows} />
    </div>
  );
};

export default DataGrid;
