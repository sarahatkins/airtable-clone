// app/page.tsx
"use client";

import React, { useEffect, useState, type SetStateAction } from "react";
import { faker } from "@faker-js/faker";
import { FileText, User, Plus } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFilter,
} from "@tanstack/react-table";
import EditableCell from "./TableComponents/EditableCell";
import TableFilters from "./TableComponents/TableFilters";
import type { Col, Row } from "~/app/defaults";

interface SelectedRowsProps {
  rows: Row[];
  cols: Col[];
}

const SelectedTableRows: React.FC<SelectedRowsProps> = ({ rows, cols }) => {
  const [data, setData] = useState<Row[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const columns = cols.map((col) => ({
    accessorKey: col.name,
    header: col.name,
    size: 120,
    cell: EditableCell,
    enableColumnFilter: true,
  }));

  useEffect(() => {
    console.log("COLUMNS", columns, cols)
  }, [columns])
  

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) =>
        setData((prev) =>
          prev.map((row, idx) =>
            idx === rowIndex ? { ...row, [columnId]: value } : row,
          ),
        ),
    },
  });

  useEffect(() => {
    setData(rows);
  }, [rows]);

  return (
    <div className="table w-full">
      <TableFilters
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
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
              {
                {
                  asc: " 🔼",
                  desc: " 🔽",
                }[header.column.getIsSorted() as string]
              }
              <div
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
                className={`absolute top-0 right-0 h-full w-1 cursor-col-resize transition-colors duration-150 select-none ${header.column.getIsResizing() ? "bg-blue-500" : "bg-transparent"} `}
              />
            </div>
          ))}
        </div>
      ))}

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

      <div className="mt-2 flex items-center gap-3">
        {/* Page Info */}
        <p className="text-sm text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </p>

        {/* Pagination Buttons */}
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-l-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-r-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {">"}
          </button>
        </div>
      </div>
    </div>

    // <div className="flex flex-col h-full">
    //   {/* Header + rows*/}
    //   <div className="">

    //   <div
    //     className="grid border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500"
    //     style={{
    //       gridTemplateColumns: "40px 150px 180px 150px 100px 120px 140px",
    //     }}
    //   >
    //     <div className="px-2 py-2 flex items-center justify-center">
    //       <input type="checkbox" />
    //     </div>
    //     <div className="border-r border-gray-200 px-3 py-2">Name</div>
    //     <div className="flex items-center gap-1 border-r border-gray-200 px-3 py-2">
    //       <FileText className="h-3 w-3" /> Notes
    //     </div>
    //     <div className="flex items-center gap-1 border-r border-gray-200 px-3 py-2">
    //       <User className="h-3 w-3" /> Assignee
    //     </div>
    //     <div className="border-r border-gray-200 px-3 py-2">Status</div>
    //     <div className="border-r border-gray-200 px-3 py-2">Attachments</div>
    //     <div className="px-3 py-2">Attachment Size</div>
    //   </div>

    //   {/* Rows */}
    //   <div className="overflow-y-auto flex-grow">

    //   {rows.map((row, idx) => (
    //     <div
    //     key={idx}
    //     className="grid border-b border-gray-100 text-sm bg-white"
    //     style={{
    //       gridTemplateColumns: "40px 150px 180px 150px 100px 120px 140px",
    //     }}
    //     >
    //       <div className="px-2 py-2 flex items-center justify-center text-gray-400">
    //         <input type="checkbox" />
    //       </div>
    //       <div className="px-3 py-2">{row.name}</div>
    //       <div className="px-3 py-2">{row.notes}</div>
    //       <div className="px-3 py-2">{row.assignee}</div>
    //       <div className="px-3 py-2">{row.status}</div>
    //       <div className="px-3 py-2">{row.attachments}</div>
    //       <div className="px-3 py-2 text-gray-500 text-xs">
    //         {row.attachmentSize}
    //       </div>
    //     </div>
    //   ))}
    //     </div>

    //   {/* Add Row Button */}
    //   <div className="bg-white text-gray-500 text-xs px-3 py-2">
    //     <button
    //       onClick={() => setRows([...rows, generateFakeRow()])}
    //       className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
    //     >
    //       <Plus size={16} />
    //     </button>
    //   </div>
    //     </div>

    //   {/* Footer */}
    //   <div className="text-gray-500 text-xs px-3 py-1 ">
    //     {rows.length} record{rows.length !== 1 ? "s" : ""}
    //   </div>
    // </div>
  );
};
export default SelectedTableRows;
