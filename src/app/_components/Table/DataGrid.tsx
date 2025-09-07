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

const DataGrid: React.FC<DataGridProps> = ({
  table,
  view,
  cols,
  setCols,
  searchText,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const {
    data: viewData,
    isFetching,
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
        // 👇 Adjust this logic based on your API response
        return lastPage.nextCursor ?? undefined;
      },
    },
  );

  const rows = viewData?.pages.flatMap((page) => page.rows) ?? [];

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

  return (
    <div
      ref={scrollRef}
      className="flex h-full w-full flex-col overflow-y-auto"
    >
      <div
        className="relative mx-auto w-full max-w-2xl flex flex-col"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((vI) => {
          const row = rows[vI.index]; // grabs the actual row
          if (!row) return;
          return (
            <div
              key={vI.key}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${vI.start}px)`,
                height: `${vI.size}px`,
              }}
              data-index={vI.index}
            >
              {row.id}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// const DataGrid: React.FC<DataGridProps> = ({
// table,
// view,
// cols,
// setCols,
// searchText,
// }) => {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const tableRef = useRef<HTMLTableElement>(null);
//   const [rows, setRows] = useState<NormalizedRow[]>([]);
//   const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({
//     row: 0,
//     col: 0,
//   });

// const { data: viewData, isFetching } = api.table.getFilterCells.useIniniteQuery(
//   { viewId: view?.id ?? 0, limit: 100, searchText },
//   { enabled: !!view?.id },
// ) as UseQueryResult<ViewDataResult>;

//   // Normalize rows when viewData changes
//   useEffect(() => {
//     if (!viewData?.rows) return;

//     const normalizedRows: NormalizedRow[] = viewData.rows.map((row) => {
//       const rowObj: NormalizedRow = {
//         id: row.id,
//         tableId: table.id,
//       };
//       for (const cell of row.cells) {
//         rowObj[`col_${cell.columnId}`] = cell.value;
//       }
//       return rowObj;
//     });

//     setRows(normalizedRows);
//   }, [viewData, table.id]);

//   const reactColumns = cols.map((col) => ({
//     accessorKey: `col_${col.id}`,
//     header: col.name,
//     size: 200,
//     enableColumnFilter: true,
//     meta: { col },
//     cell: EditableCell,
//   }));

//   const reactTable = useReactTable({
//     data: rows, // <-- use the state here
//     columns: reactColumns,
//     getCoreRowModel: getCoreRowModel(),
//     enableColumnResizing: true,
//     columnResizeMode: "onEnd",
//     meta: {
//       updateData: (rowIndex: number, columnId: string, value: CellValue) => {
//         setRows((prev) =>
//           prev.map((row, idx) =>
//             idx === rowIndex ? { ...row, [columnId]: value } : row,
//           ),
//         );
//       },
//     },
//   });

//   // useEffect(() => {
//   //   const handleKeyDown = (e: KeyboardEvent) => {
//   //     const rows = reactTable.getRowModel().rows.length;
//   //     const cols = reactTable.getHeaderGroups()?.[0]?.headers?.length ?? 0;

//   //     if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
//   //       e.preventDefault();
//   //       setFocusedCell((prev) => {
//   //         let { row, col } = prev;
//   //         if (e.key === "ArrowUp") row = Math.max(0, row - 1);
//   //         if (e.key === "ArrowDown") row = Math.min(rows - 1, row + 1);
//   //         if (e.key === "ArrowLeft") col = Math.max(0, col - 1);
//   //         if (e.key === "ArrowRight") col = Math.min(cols - 1, col + 1);
//   //         return { row, col };
//   //       });
//   //     }
//   //   };

//   //   window.addEventListener("keydown", handleKeyDown);
//   //   return () => window.removeEventListener("keydown", handleKeyDown);
//   // }, [table]);

//   // useEffect(() => {
//   //   if (tableRef.current) {
//   //     const cell = tableRef.current.querySelector(
//   //       `td[data-row="${focusedCell.row}"][data-col="${focusedCell.col}"]`,
//   //     ) as HTMLTableCellElement;
//   //     if (cell) cell.focus();
//   //   }
//   // }, [focusedCell]);
//   return (
//     <table
//       ref={tableRef}
//       className="w-full table-auto border-collapse border border-gray-300"
//     >
//       <thead>
//         {reactTable.getHeaderGroups().map((headerGroup) => (
//           <tr key={headerGroup.id}>
//             {headerGroup.headers.map((header) => (
//               <th
//                 key={header.id}
//                 className="border border-gray-300 bg-gray-100 px-4 py-2 text-left"
//               >
//                 {flexRender(
//                   header.column.columnDef.header,
//                   header.getContext(),
//                 )}
//               </th>
//             ))}
//           </tr>
//         ))}
//       </thead>
//       <tbody>
//         {reactTable.getRowModel().rows.map((row, rowIndex) => (
//           <tr key={row.id}>
//             {row.getVisibleCells().map((cell, colIndex) => (
//               <td
//                 key={cell.id}
//                 tabIndex={0}
//                 data-row={rowIndex}
//                 data-col={colIndex}
//                 className={`border border-gray-300 px-4 py-2 focus:outline-none ${
//                   focusedCell.row === rowIndex && focusedCell.col === colIndex
//                     ? "bg-blue-100"
//                     : ""
//                 }`}
//               >
//                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
//               </td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };
// const [rows, setRows] = useState<NormalizedRow[]>([]);
// const [cursor, setCursor] = useState<number | undefined>(undefined);
// const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);
// const [isFreshFetch, setIsFreshFetch] = useState<boolean>(false);

// const rowVirtualizer = useVirtualizer({
//   count: rows.length,
//   getScrollElement: () => scrollRef.current,
//   estimateSize: () => ROW_HEIGHT,
//   overscan: rows.length > 100 ? 10 : 2,
// });

// const virtualItems = rowVirtualizer.getVirtualItems();

// const totalWidth = useMemo(
//   () => reactColumns.reduce((sum, c) => sum + (c.size ?? 150) + 150, 0),
//   [reactColumns],
// );

// useEffect(() => {
//   if (!viewData) return;

//   const { rows: newRows, nextCursor } = viewData;
//   const normalized = normalizeRows(newRows);
//   console.log("NEW ROWS", newRows);

//   // always replace rows on fresh fetch
//   setRows((prev) => (isFreshFetch ? normalized : [...prev, ...normalized]));

//   setNextCursor(nextCursor ?? undefined);

//   // After first fetch, set isFreshFetch = false
//   if (isFreshFetch) setIsFreshFetch(false);
// }, [viewData, isFreshFetch, normalizeRows]);

// const loadMoreRows = useCallback(() => {
//   if (nextCursor && !isFetching) {
//     setCursor(nextCursor);
//   }
// }, [nextCursor, isFetching]);

// useEffect(() => {
//   if (!view) return;

//   setRows([]);
//   setIsFreshFetch(true);
//   setCursor(undefined); // trigger a fresh fetch with no cursor
//   setNextCursor(undefined);
// }, [view, searchText]);

// useEffect(() => {
//   const lastVisible = rowVirtualizer.getVirtualItems().slice(-1)[0];
//   if (!lastVisible) return;

//   if (lastVisible.index >= rows.length - 100) {
//     setIsFreshFetch(false);
//     loadMoreRows();
//   }
// }, [rowVirtualizer, virtualItems, rows.length, loadMoreRows]);

// return (
// <div ref={scrollRef} className="flex h-screen w-full flex-col">
//   {/* Toolbar + sticky header wrapper (sticky keeps header visible while vertical-scrolling) */}
//   <div className="sticky top-0 z-20 border-b border-gray-200 bg-transparent">
//     <div className="flex items-center gap-2 px-2 py-2">
//       <HundredThousandButton tableId={table.id} />
//       <div className="text-xs text-gray-500">
//         {rows.length.toLocaleString()} rows
//       </div>
//     </div>
//   </div>

//   <div ref={scrollRef} className="overflow-auto" style={{ height: "100%" }}>
//     <div style={{ width: Math.max(totalWidth + 200, 800) }}>
//       {/* Header */}
//       {reactTable.getHeaderGroups().map((hg) => (
//         <div key={hg.id} className="flex border-t border-b border-gray-200">
//           {hg.headers.map((header) => (
//             <div
//               key={header.id}
//               className="border-r border-gray-200 bg-white px-3 py-2 text-sm font-semibold"
//               style={{ width: header.getSize() }}
//             >
//               <>
//                 {flexRender(
//                   header.column.columnDef.header,
//                   header.getContext(),
//                 )}
//                 {/* {header.getCanResize() && (
//                   <div
//                     onMouseDown={header.getResizeHandler()} // Attach resize handler
//                     onTouchStart={header.getResizeHandler()}
//                     className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
//                   />
//                 )} */}
//               </>
//             </div>
//           ))}
//           <div
//             key="column_add"
//             className="flex cursor-pointer items-center justify-center border-r border-gray-200 bg-white hover:bg-neutral-50"
//             style={{ minWidth: "120px" }}
//           >
//             <CreateColButton dbTable={table} setCols={setCols} />
//           </div>
//         </div>
//       ))}

//       {/* Body (virtualized rows) */}
//       <div
//         className="relative"
//         style={{
//           height: rowVirtualizer.getTotalSize(),
//           position: "relative",
//         }}
//       >
//         {rowVirtualizer.getVirtualItems().map((vr) => {
//           const r = reactTable.getRowModel().rows[vr.index];
//           if (!r) return null;
//           return (
//             <div
//               key={vr.key}
//               className="absolute top-0 left-0 flex items-center border-b border-gray-200 hover:bg-neutral-50"
//               style={{
//                 height: `${vr.size}px`,
//                 transform: `translateY(${vr.start}px)`,
//               }}
//               data-index={vr.index}
//             >
//               {r.getVisibleCells().map((cell) => (
//                 <div
//                   key={cell.id}
//                   className="overflow-hidden border-r border-gray-200 text-ellipsis whitespace-nowrap"
//                   style={{ width: cell.column.getSize() }}
//                 >
//                   {flexRender(
//                     cell.column.columnDef.cell,
//                     cell.getContext(),
//                   )}
//                 </div>
//               ))}
//             </div>
//           );
//         })}
//       </div>

//       <CreateRowButton dbTable={table} setRows={setRows} />
//     </div>
//   </div>
// </div>
//   );
// };

export default DataGrid;
