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
  const [isFreshFetch, setIsFreshFetch] = useState<boolean>(false);
  const {
    data: viewData,
    refetch: refetchViewData,
    isFetching,
  } = api.table.getFilterCells.useQuery(
    { viewId: view?.id ?? 0, limit: 1000, cursor },
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
    if(isFreshFetch) {
      setRows(normalized);  
    } else {
      setRows((prev) => [...prev, ...normalized]);
    }

    setCursor(nextCursor ?? undefined);
  }, [viewData]);

  const loadMoreRows = () => {
    if (cursor && !isFetching) {
      refetchViewData(); // backend returns next batch using cursor
    }
  };

  const normalizeRows = (rowsWithCells: any[]) => {
    console.log(rowsWithCells)
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
    setCursor(undefined);
    refetchViewData();
    setIsFreshFetch(true)
  }, [view]);

  useEffect(() => {
    const lastVisible = rowVirtualizer.getVirtualItems().slice(-1)[0];
    if (!lastVisible) return;

    // If the last visible row is within 5 rows of the total rows, load more
    if (lastVisible.index >= rows.length - 5) {
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
                className="flex items-center border-b border-gray-200 hover:bg-neutral-50"
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
