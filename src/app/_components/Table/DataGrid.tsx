import React, { useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColType, RowType, TableType } from "~/app/defaults";
import EditableCell from "./TableComponents/EditableCell";
import { api } from "~/trpc/react";
import CreateRowButton from "./TableComponents/buttons/CreateRowButton";
import CreateColButton from "./TableComponents/buttons/CreateColButton";

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
    size: 200,
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
    <div className="h-[500px] w-full overflow-auto">
      <div className="table min-w-max bg-gray-50 text-sm font-normal text-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-2">
          <CreateRowButton dbTable={table} cols={cols} setRows={setRows} />
          <CreateColButton dbTable={table} setCols={setCols} />
        </div>
        <div className="border-t border-b border-gray-200 bg-white">
          {reactTable.getHeaderGroups().map((headerGroup) => (
            <div
              className="tr flex border-b border-gray-200"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => (
                <div
                  className="th relative flex items-center border-r border-gray-200 bg-white px-3 py-2 text-sm font-semibold"
                  style={{ width: header.getSize() }}
                  key={header.id}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {/* Sorting & Resize */}
                  {header.column.getCanSort() && (
                    <button
                      onClick={header.column.getToggleSortingHandler()}
                      className="text-b ml-1 text-xs hover:text-gray-700"
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
        </div>

        {/* Rows */}
        <div className="bg-white">
          {reactTable.getRowModel().rows.map((row) => (
            <div
              className="tr flex items-center transition-colors hover:bg-blue-50"
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <div
                  className="td overflow-hidden border-r border-b border-gray-200 text-ellipsis whitespace-nowrap"
                  style={{ width: cell.column.getSize() }}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
          {rows.length} record{rows.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
