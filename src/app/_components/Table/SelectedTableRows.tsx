import React from "react";
import { flexRender, type Table } from "@tanstack/react-table";
import type { ColType, RowType } from "~/app/defaults";
import TableFilters from "./TableComponents/TableFilters";

interface SelectedRowsProps {
  table: Table<any>;
  rows: RowType[];
  cols: ColType[];
  columnFilters: any[];
  setRows: React.Dispatch<React.SetStateAction<RowType[]>>;
  setCols: React.Dispatch<React.SetStateAction<ColType[]>>;
  setColumnFilters: React.Dispatch<React.SetStateAction<any[]>>;
}

const SelectedTableRows: React.FC<SelectedRowsProps> = ({
  table,
  rows,
  cols,
  columnFilters,
  setRows,
  setCols,
  setColumnFilters,
}) => {
  return (
    <div className="table w-full">
      <TableFilters columnFilters={columnFilters} setColumnFilters={setColumnFilters} />

      {/* Header */}
      {table.getHeaderGroups().map((headerGroup) => (
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
              {{
                asc: " 🔼",
                desc: " 🔽",
              }[header.column.getIsSorted() as string]}
              <div
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
                className={`absolute top-0 right-0 h-full w-1 cursor-col-resize select-none ${
                  header.column.getIsResizing() ? "bg-blue-500" : "bg-transparent"
                }`}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Rows */}
      {table.getRowModel().rows.map((row) => (
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
      <div className="text-gray-500 text-xs px-3 py-1 ">
        {rows.length} record{rows.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default SelectedTableRows;
