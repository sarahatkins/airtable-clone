import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type {
  CellType,
  CellValue,
  ColType,
  SortingType,
  TableType,
  ViewConfigType,
  ViewType,
} from "~/app/defaults";
import EditableCell from "./EditableCell";
import { useVirtualizer } from "@tanstack/react-virtual";
import CreateColButton from "./buttons/CreateColButton";
import { api } from "~/trpc/react";
import ColumnHeader from "./buttons/ColumnHeader";
import IndexCell from "./buttons/IndexCell";
import RowModal from "./modals/RowModal";
import LoadingScreen from "./LoadingScreen";

interface DataGridProps {
  table: TableType;
  numRows: number;
  view: ViewType;
  cols: ColType[];
  searchText: string | undefined;
  setCols: Dispatch<SetStateAction<ColType[]>>;
  rows: NormalizedRow[];
  setRows: Dispatch<SetStateAction<NormalizedRow[]>>;
}

const ROW_HEIGHT = 30;

export type NormalizedRow = {
  id: number;
  tableId: number;
} & Record<string, CellValue>;

export type CellCoord = { row: number; col: number };

const DataGrid: React.FC<DataGridProps> = ({
  table,
  numRows,
  view,
  cols,
  setCols,
  searchText,
  rows,
  setRows,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [focusedCell, setFocusedCell] = useState<CellCoord | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

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
      limit: 1000,
      searchText,
    },
    {
      enabled: !!view?.id,
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined;
      },
    },
  );

  const cellsLoading = (rows.length === 0 && numRows != 0) || !viewData;

  const matchedCells: CellType[] = useMemo(() => {
    if (!viewData?.pages) return [];

    return viewData.pages.flatMap((page) => page.matchedCells ?? []);
  }, [viewData]);

  const normalizedRows: NormalizedRow[] = useMemo(() => {
    if (!viewData?.pages) return [];
    console.log("Pages fetched:", viewData?.pages.length);
    return viewData.pages.flatMap((page) =>
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
  }, [viewData, table.id]);

  useEffect(() => {
    setRows(normalizedRows);
  }, [setRows, normalizedRows]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => scrollRef.current,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingNextPage) return;

    const target = e.currentTarget;
    const scrollTop = target.scrollTop; // how far we scrolled
    const scrollHeight = target.scrollHeight; // total scrollable height
    const clientHeight = target.clientHeight; // visible height

    const virtualItems = virtualizer.getVirtualItems();
    if (!virtualItems.length) return;

    const lastVisibleIndex = virtualItems[virtualItems.length - 1]!.index;

    const buffer = 500; // trigger when we are 500 rows away
    if ((lastVisibleIndex >= rows.length - buffer) && (scrollTop + clientHeight >= scrollHeight/2)) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    fetchNextPage();
  }, []);

  const indexColumn = useMemo<ColumnDef<NormalizedRow, unknown>>(
    () => ({
      accessorKey: "__rowIndex",
      header: () => (
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
        },
        colIndex: -1,
      },
      cell: ({ row }) => (
        <IndexCell
          key={row.index}
          row={row}
          hoveredRowId={hoveredRowId}
          setHoveredRowId={setHoveredRowId}
          setSelectedRows={setRowSelection}
          selectedRows={rowSelection}
        />
      ),
    }),
    [
      rowSelection,
      rows,
      hoveredRowId,
      setHoveredRowId,
      setRowSelection,
      table.id,
    ],
  );

  const reactColumns = useMemo<ColumnDef<NormalizedRow, CellValue>[]>(
    () => [
      indexColumn,
      ...cols.map((col, colIdx) => ({
        accessorKey: `col_${col.id}`,
        header: () => (
          <ColumnHeader
            title={col.name}
            type={col.type}
            colId={col.id}
            tableId={table.id}
          />
        ),
        size: 200,
        enableColumnFilter: true,
        meta: { col, colIndex: colIdx },
        cell: EditableCell,
      })),
    ],
    [cols, table.id, indexColumn],
  );

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

  if (cellsLoading) return <LoadingScreen message=" filtered cells..." />;

  return (
    // <div className="h-full w-full overflow-x-auto" >
    <div
      className="h-full w-full overflow-x-auto overflow-y-hidden"
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
      {/* HEADER */}
      <div
        style={{ maxWidth: Math.max(totalWidth + 200, 800) }}
        className={`w-full h-[${ROW_HEIGHT}px] overflow-hidden border-b border-gray-200`}
      >
        {reactTable.getHeaderGroups().map((hg) => (
          <div key={hg.id} className="flex border-t border-gray-200 bg-gray-50">
            {hg.headers.map((header) => {
              const colIdMatch = /_(\d+)/.exec(header.id);
              const colId = colIdMatch?.[1] ? Number(colIdMatch[1]) : undefined;

              const filteredCell = (
                view.config as ViewConfigType
              ).filters?.args.some((leaf) => leaf.args[0] === colId);
              const sortedCell =
                colId !== null
                  ? (view.config as ViewConfigType).sorting.some(
                      (s: SortingType) => s.columnId === colId,
                    )
                  : false;
              return (
                <div
                  key={header.id}
                  className={`border-b border-gray-200 px-3 py-1 text-sm font-semibold ${
                    header.column.id !== "__rowIndex"
                      ? "border-r"
                      : "flex justify-center"
                  } ${filteredCell ? "bg-green-50" : sortedCell ? "bg-orange-50" : "bg-white"}`}
                  style={{ width: header.getSize() }}
                >
                  <>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </>
                </div>
              );
            })}
            <div
              key="column_add"
              // style={{ width: Math.max(totalWidth + 200, 800) }}
              className="flex cursor-pointer items-center justify-center border-r border-b border-gray-200 bg-white hover:bg-neutral-50"
              style={{ minWidth: "120px" }}
            >
              <CreateColButton dbTable={table} setCols={setCols} />
            </div>
          </div>
        ))}
      </div>

      {/* BODY DIV */}
      <div
        className="overflow-y-auto bg-red-100"
        style={{
          height: `calc(100% - ${ROW_HEIGHT}px - 16px)`,
        }}
        onScroll={handleScroll}
      >
        <div
          ref={scrollRef}
          style={{
            height: virtualizer.getTotalSize(),
            position: "relative",
            width: Math.max(contentWidth, scrollRef.current?.clientWidth ?? 0),
          }}
        >
          {virtualizer.getVirtualItems().map((vr) => {
            const r = reactTable.getRowModel().rows[vr.index];
            if (!r || !rows.includes(r.original)) return null;

            const selectedRow = rowSelection.includes(r.original.id);
            return (
              <div key={vr.key} onContextMenu={(e) => e.stopPropagation()}>
                <div
                  className={`absolute top-0 left-0 flex items-center border-b border-gray-200 ${selectedRow ? "bg-blue-50" : "bg-white"} hover:bg-neutral-50`}
                  style={{
                    height: `${vr.size}px`,
                    transform: `translateY(${vr.start}px)`,
                  }}
                  data-index={vr.index}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      rowId: r.id,
                    });
                  }}
                >
                  {r.getVisibleCells().map((cell) => {
                    const colIdMatch = /_(\d+)/.exec(cell.column.id);
                    const colId = colIdMatch?.[1]
                      ? Number(colIdMatch[1])
                      : undefined;

                    const matchingCell = matchedCells.find(
                      (c) => c.rowId === r.original.id && c.columnId === colId,
                    );
                    const filteredCell = (
                      view.config as ViewConfigType
                    ).filters?.args.some((leaf) => leaf.args[0] === colId);
                    const sortedCell =
                      colId !== null
                        ? (view.config as ViewConfigType).sorting.some(
                            (s: SortingType) => s.columnId === colId,
                          )
                        : false;
                    return (
                      <div
                        key={cell.id}
                        className={`overflow-hidden text-ellipsis whitespace-nowrap ${
                          cell.column.id !== "__rowIndex" &&
                          "border-r border-gray-200"
                        } ${matchingCell ? "bg-amber-200" : filteredCell ? "bg-green-100" : sortedCell ? "bg-orange-100" : ""}`}
                        style={{ width: cell.column.getSize() }}
                        onContextMenu={() => {
                          setRowSelection((prev) => [
                            ...prev,
                            cell.row.original.id,
                          ]);
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    );
                  })}
                </div>
                <RowModal
                  x={contextMenu?.x ?? 0}
                  y={contextMenu?.y ?? 0}
                  isOpen={contextMenu != null}
                  onClose={() => setContextMenu(null)}
                  setRows={setRows}
                  selectedRows={rowSelection}
                  setRowSelection={setRowSelection}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
    // </div>
  );

  // return (
  //   <div className="h-full w-full">
  // <div
  //   ref={scrollRef}
  //   className="overflow-auto"
  //   style={{ height: "100%" }}
  //   tabIndex={0}
  //   onKeyDown={(e) => {
  //     if (!focusedCell) return;

  //     const maxRows = rows.length;
  //     const maxCols = cols.length;

  //     const next = { ...focusedCell };

  //     switch (e.key) {
  //       case "ArrowRight":
  //         if (next.col < maxCols - 1) next.col += 1;
  //         break;
  //       case "ArrowLeft":
  //         if (next.col > 0) next.col -= 1;
  //         break;
  //       case "ArrowDown":
  //         if (next.row < maxRows - 1) next.row += 1;
  //         break;
  //       case "ArrowUp":
  //         if (next.row > 0) next.row -= 1;
  //         break;
  //       default:
  //         return;
  //     }

  //     e.preventDefault();
  //     setFocusedCell(next);
  //     virtualizer.scrollToIndex(next.row); // ensure visible
  //   }}
  // >
  //       {/* LONG LINE */}
  //       {/* <div className="absolute left-136 top-31 bottom-8.5 w-px bg-gray-400 z-10" /> */}
  // <div style={{ width: Math.max(totalWidth + 200, 800) }}>
  //   {/* Header */}
  //   {reactTable.getHeaderGroups().map((hg) => (
  //     <div
  //       key={hg.id}
  //       className="flex border-t border-gray-200 bg-gray-50"
  //     >
  //       {hg.headers.map((header) => {
  //         const colIdMatch = /_(\d+)/.exec(header.id);
  //         const colId = colIdMatch?.[1]
  //           ? Number(colIdMatch[1])
  //           : undefined;

  //         const filteredCell = (
  //           view.config as ViewConfigType
  //         ).filters?.args.some((leaf) => leaf.args[0] === colId);
  //         const sortedCell =
  //           colId !== null
  //             ? (view.config as ViewConfigType).sorting.some(
  //                 (s: SortingType) => s.columnId === colId,
  //               )
  //             : false;
  //         return (
  //           <div
  //             key={header.id}
  //             className={`border-b border-gray-200 px-3 py-1 text-sm font-semibold ${
  //               header.column.id !== "__rowIndex"
  //                 ? "border-r"
  //                 : "flex justify-center"
  //             } ${filteredCell ? "bg-green-50" : sortedCell ? "bg-orange-50" : "bg-white"}`}
  //             style={{ width: header.getSize() }}
  //           >
  //             <>
  //               {flexRender(
  //                 header.column.columnDef.header,
  //                 header.getContext(),
  //               )}
  //             </>
  //           </div>
  //         );
  //       })}
  //       <div
  //         key="column_add"
  //         className="flex cursor-pointer items-center justify-center border-r border-b border-gray-200 bg-white hover:bg-neutral-50"
  //         style={{ minWidth: "120px" }}
  //       >
  //         <CreateColButton dbTable={table} setCols={setCols} />
  //       </div>
  //     </div>
  //   ))}

  //         {/* Body (virtualized rows) */}
  // <div
  //   className="relative"
  //   style={{
  //     height: virtualizer.getTotalSize(),
  //     position: "relative",
  //   }}
  // >
  //   {virtualizer.getVirtualItems().map((vr) => {
  //     const r = reactTable.getRowModel().rows[vr.index];
  //     if (!r || !rows.includes(r.original)) return null;

  //     const selectedRow = rowSelection.includes(r.original.id);
  //     return (
  //       <div key={vr.key} onContextMenu={(e) => e.stopPropagation()}>
  //         <div
  //           className={`absolute top-0 left-0 flex items-center border-b border-gray-200 ${selectedRow ? "bg-blue-50" : "bg-white"} hover:bg-neutral-50`}
  //           style={{
  //             height: `${vr.size}px`,
  //             transform: `translateY(${vr.start}px)`,
  //           }}
  //           data-index={vr.index}
  //           onContextMenu={(e) => {
  //             e.preventDefault();
  //             setContextMenu({
  //               x: e.clientX,
  //               y: e.clientY,
  //               rowId: r.id,
  //             });
  //           }}
  //         >
  //           {r.getVisibleCells().map((cell) => {
  //             const colIdMatch = /_(\d+)/.exec(cell.column.id);
  //             const colId = colIdMatch?.[1]
  //               ? Number(colIdMatch[1])
  //               : undefined;

  //             const matchingCell = matchedCells.find((c) =>
  //               c.rowId === r.original.id && c.columnId === colId,
  //             );
  //             const filteredCell = (
  //               view.config as ViewConfigType
  //             ).filters?.args.some((leaf) => leaf.args[0] === colId);
  //             const sortedCell =
  //               colId !== null
  //                 ? (view.config as ViewConfigType).sorting.some(
  //                     (s: SortingType) => s.columnId === colId,
  //                   )
  //                 : false;
  //             return (
  //               <div
  //                 key={cell.id}
  //                 className={`overflow-hidden text-ellipsis whitespace-nowrap ${
  //                   cell.column.id !== "__rowIndex" &&
  //                   "border-r border-gray-200"
  //                 } ${matchingCell ? "bg-amber-200" :filteredCell ? "bg-green-100" : sortedCell ? "bg-orange-100" : ""}`}
  //                 style={{ width: cell.column.getSize() }}
  //                 onContextMenu={() => {
  //                   setRowSelection((prev) => [
  //                     ...prev,
  //                     cell.row.original.id,
  //                   ]);
  //                 }}
  //               >
  //                 {flexRender(
  //                   cell.column.columnDef.cell,
  //                   cell.getContext(),
  //                 )}
  //               </div>
  //             );
  //           })}
  //         </div>
  //         <RowModal
  //           x={contextMenu?.x ?? 0}
  //           y={contextMenu?.y ?? 0}
  //           isOpen={contextMenu != null}
  //           onClose={() => setContextMenu(null)}
  //           setRows={setRows}
  //           selectedRows={rowSelection}
  //           setRowSelection={setRowSelection}
  //         />
  //       </div>
  //     );
  //   })}
  // </div>
  //         <div style={{ width: contentWidth }}>
  //           <CreateRowButton dbTable={table} setRows={setRows} />
  //         </div>
  //       </div>
  //     </div>
  //     <FloatingAddRows dbTable={table} setRows={setRows} />
  //   </div>
  // );
};

export default DataGrid;
