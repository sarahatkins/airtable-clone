import React, { useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColType, RowType, TableType } from "~/app/defaults";
import EditableCell from "./TableComponents/EditableCell";
import { api } from "~/trpc/react";
import CreateRowButton from "./TableComponents/CreateRowButton";
import CreateColButton from "./TableComponents/CreateColButton";

interface DataGridProps {
  table: TableType;
  rows: RowType[];
  cols: ColType[];
  setRows: React.Dispatch<React.SetStateAction<RowType[]>>;
  setCols: React.Dispatch<React.SetStateAction<ColType[]>>;
}

const DataGrid: React.FC<DataGridProps> = ({
  table,
  rows,
  cols,
  setRows,
  setCols,
}) => {
  // const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const reactColumns = cols.map((col) => ({
    accessorKey: col.name,
    header: col.name,
    size: 120,
    cell: EditableCell,
    enableColumnFilter: true,
    meta: { col }, // keep a reference to column info
  }));

  const reactTable = useReactTable({
    data: rows,
    columns: reactColumns,
    getCoreRowModel: getCoreRowModel(),
    // state: { columnFilters },
    // onColumnFiltersChange: setColumnFilters,
    // getFilteredRowModel: getFilteredRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) =>
        setRows((prev) =>
          prev.map((row, idx) =>
            idx === rowIndex ? { ...row, [columnId]: value } : row,
          ),
        ),
    },
  });

  // Fetch all cell values for each row
  const rowIds = rows.map((r) => r.id);
  const { data: cellValues, isLoading: cellsLoading } =
    api.table.getCellsByRows.useQuery(
      { rowIds },
      { enabled: rowIds.length > 0 },
    );

  // Hydrate rows with cell values when they load
  useEffect(() => {
    if (!cellValues) return;

    const hydratedRows = rows.map((row) => {
      const cellsForRow = cellValues.filter((cv) => cv.rowId === row.id);
      const rowWithCells: any = { ...row };
      cellsForRow.forEach((cell) => {
        const col = cols.find((c) => c.id === cell.columnId);
        if (col) rowWithCells[col.name] = cell.value;
      });
      return rowWithCells;
    });

    setRows((prev) => {
      const localUnsynced = prev.filter(
        (r) => !rows.some((tr) => tr.id === r.id),
      );
      return [...hydratedRows, ...localUnsynced];
    });
  }, [cellValues]);

  return (
    <div className="table w-full">
      {/* <TableFilters columnFilters={columnFilters} setColumnFilters={setColumnFilters} /> */}
      <CreateRowButton dbTable={table} cols={cols} setRows={setRows} />
      <CreateColButton dbTable={table} setCols={setCols} />
      {/* Header */}
      {reactTable.getHeaderGroups().map((headerGroup) => (
        <div className="tr flex" key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <div
              className="th relative flex items-center border-b px-2 py-1"
              style={{ width: header.getSize() }}
              key={header.id}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {header.column.getCanSort() && (
                <button
                  onClick={header.column.getToggleSortingHandler()}
                  className="ml-2 text-xs text-gray-600 hover:text-black"
                >
                  ⇅
                </button>
              )}
              {
                {
                  asc: " 🔼",
                  desc: " 🔽",
                }[header.column.getIsSorted() as string]
              }
              <div
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
                className={`absolute top-0 right-0 h-full w-1 cursor-col-resize select-none ${
                  header.column.getIsResizing()
                    ? "bg-blue-500"
                    : "bg-transparent"
                }`}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Rows */}
      {reactTable.getRowModel().rows.map((row) => (
        <div className="tr flex" key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <div
              className="td border-b px-2 py-1"
              style={{ width: cell.column.getSize() }}
              key={cell.id}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ))}
        </div>
      ))}

      {/* Footer */}
      <div className="px-3 py-1 text-xs text-gray-500">
        {rows.length} record{rows.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default DataGrid;
