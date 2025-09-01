import React, { useRef, useMemo, useState, startTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColType, RowType, TableType, ViewType } from "~/app/defaults";
import EditableCell from "./TableComponents/EditableCell";
import { useVirtualizer } from "@tanstack/react-virtual";
import HundredThousandButton from "./TableComponents/buttons/100kButton";
import CreateColButton from "./TableComponents/buttons/CreateColButton";

interface DataGridProps {
  table: TableType;
  view: ViewType;
  rows: RowType[];
  cols: ColType[];
  setRows: React.Dispatch<React.SetStateAction<RowType[]>>;
  setCols: React.Dispatch<React.SetStateAction<ColType[]>>;
}

const ROW_HEIGHT = 41;

const DataGrid: React.FC<DataGridProps> = ({
  table,
  view,
  rows,
  cols,
  setRows,
  setCols,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const reactColumns = useMemo(
    () =>
      cols.map((col) => ({
        accessorKey: col.name,
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
    // @ts-ignore
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
    () => reactColumns.reduce((sum, c) => sum + (c.getSize?.() ?? 150) + 150, 0),
    [table],
  );

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Toolbar + sticky header wrapper (sticky keeps header visible while vertical-scrolling) */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-2 py-2">
          <HundredThousandButton tableId={table.id} />
          <div className="text-xs text-gray-500">
            {rows.length.toLocaleString()} rows
          </div>
        </div>

        {/* Header: put it in an overflow-x container so it scrolls horizontally with the body */}
        <div className="overflow-auto">
          <div style={{ width: Math.max(totalWidth+200, 800) }}>
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
                  className="cursor-pointer flex items-center justify-center border-r border-gray-200 bg-white hover:bg-gray-200"
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
      <div
        ref={parentRef}
        className="relative flex-1 overflow-auto bg-transparent"
      >
        {/* Inner spacer must be as wide as the total table to enable horizontal scroll */}
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: Math.max(totalWidth, 800),
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((vr) => {
            const r = reactTable.getRowModel().rows[vr.index];
            if (!r) return null;
            return (
              <div
                key={r.id}
                className="flex items-center border-b border-gray-200 hover:bg-blue-50"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: vr.size,
                  width: "100%",
                  transform: `translateY(${vr.start}px)`,
                }}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataGrid;

// const DataGrid: React.FC<DataGridProps> = ({
//   table,
//   rows,
//   cols,
//   view,
//   setRows,
//   setCols,
// }) => {
//   const parentRef = useRef<HTMLDivElement>(null);

//   // React Table columns
// const reactColumns = useMemo(
//   () =>
//     cols.map((col) => ({
//       accessorKey: col.name,
//       header: col.name,
//       size: 200,
//       cell: EditableCell,
//       enableColumnFilter: true,
//       meta: { col },
//     })),
//   [cols],
// );

//   // React Table instance
//   const reactTable = useReactTable({
//     data: rows,
//     columns: reactColumns,
//     getCoreRowModel: getCoreRowModel(),
//     columnResizeMode: "onChange",
//     meta: {
//       updateData: (rowIndex: number, columnId: string, value: any) =>
//         setRows((prev) =>
//           prev.map((row, idx) =>
//             idx === rowIndex ? { ...row, [columnId]: value } : row,
//           ),
//         ),
//     },
//   });

//   // Fetch all cell values
//   const rowIds = rows.map((r) => r.id);
//   const query = useInfiniteQuery({
//     queryKey: ["cellsByView", view.id],
//     queryFn: async ({ pageParam }) => {
//       return await trpcClient.table.getCellsByRows.query({
//         rowIds,
//         // cursor: pageParam,
//         // limit: 100,
//       });
//     },
//     getNextPageParam: (last: any) => last.nextCursor,
//     initialPageParam: undefined,
//   });

//   // Flatten cell values from all pages
//   const cellValues = useMemo(
//     () => query.data?.pages.flatMap((page) => page) ?? [],
//     [query.data],
//   );

//   // Create a map from rowId -> cells for fast lookup
//   const cellMap = useMemo(() => {
//     const map: Record<number, typeof cellValues> = {};
//     cellValues.forEach((cv) => {
//       if (!map[cv.rowId]) map[cv.rowId] = [];
//       map[cv.rowId]!.push(cv);
//     });
//     return map;
//   }, [cellValues]);

//   // Hydrate rows with cell values without mutating state
//   const hydratedRows = useMemo(() => {
//     return rows.map((row) => {
//       const rowWithCells: any = { ...row };
//       (cellMap[row.id] || []).forEach((cell) => {
//         const col = cols.find((c) => c.id === cell.columnId);
//         if (col) rowWithCells[col.name] = cell.value;
//       });
//       return rowWithCells;
//     });
//   }, [rows, cellMap, cols]);

//   // Virtualizer
//   const rowVirtualizer = useVirtualizer({
//     count: hydratedRows.length + (query.hasNextPage ? 1 : 0),
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 41,
//     overscan: 10,
//   });

//   // Infinite scroll trigger
//   React.useEffect(() => {
//     const [last] = rowVirtualizer.getVirtualItems().slice(-1);
//     if (
//       last &&
//       last.index >= hydratedRows.length - 1 &&
//       query.hasNextPage &&
//       !query.isFetchingNextPage
//     ) {
//       query.fetchNextPage();
//     }
//   }, [
//     rowVirtualizer.getVirtualItems(),
//     hydratedRows.length,
//     query.hasNextPage,
//     query.isFetchingNextPage,
//   ]);

// return (
//   <div className="flex h-full w-full flex-col">
//     {/* Header */}
//     <div className="sticky top-0 z-20 flex flex-col border-b border-gray-200 bg-white">
//       <div className="flex items-center justify-between px-2 py-2">

//         <CreateRowButton dbTable={table} cols={cols} setRows={setRows} />
//         <CreateColButton dbTable={table} setCols={setCols} />

//       </div>
//       <div>
//         {reactTable.getHeaderGroups().map((headerGroup) => (
//           <div
//             className="tr flex border-b border-gray-200"
//             key={headerGroup.id}
//           >
//             {headerGroup.headers.map((header) => (
//               <div
//                 className="th relative flex items-center border-r border-gray-200 bg-white px-3 py-2 text-sm font-semibold"
//                 style={{ width: header.getSize() }}
//                 key={header.id}
//               >
//                 {flexRender(
//                   header.column.columnDef.header,
//                   header.getContext(),
//                 )}
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>

//     {/* Scrollable virtual rows */}
//     <div ref={parentRef} className="relative w-full flex-1 overflow-auto">
//       <div
//         style={{
//           height: `${rowVirtualizer.getTotalSize()}px`,
//           width: "100%",
//           position: "relative",
//         }}
//       >
//         {rowVirtualizer.getVirtualItems().map((virtualRow) => {
//           const row = hydratedRows[virtualRow.index];
//           if (!row) return null;

//           const rowIndex = virtualRow.index;
//           const tableRow = reactTable.getRowModel().rows[rowIndex];

//           return (
//             <div
//               key={row.id}
//               className="tr flex items-center border-b border-gray-200 transition-colors hover:bg-blue-50"
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 height: `${virtualRow.size}px`,
//                 transform: `translateY(${virtualRow.start}px)`,
//               }}
//             >
//               {tableRow &&
//                 tableRow.getVisibleCells().map((cell) => (
//                   <div
//                     className="td overflow-hidden border-r border-b border-gray-200 text-ellipsis whitespace-nowrap"
//                     style={{ width: cell.column.getSize() }}
//                     key={cell.id}
//                   >
//                     {flexRender(
//                       cell.column.columnDef.cell,
//                       cell.getContext(),
//                     )}
//                   </div>
//                 ))}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   </div>
// );
// };

// export default DataGrid;
