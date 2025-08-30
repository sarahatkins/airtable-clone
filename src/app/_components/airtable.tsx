// app/page.tsx
"use client";

import { Plus, ChevronDown } from "lucide-react";
import Image from "next/image";
import SelectedTable from "./Table/SelectedTable";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useDefaultTableSetup } from "./Table/CreateDefaultTable";
import type { ColType, RowType, TableType } from "../defaults";

interface AirtableProps {
  baseId: string;
}

// Goal: able to save values in a table
//  Goal: Able to add rows and cols

const AirTable: React.FC<AirtableProps> = ({ baseId }) => {
  const { data: base } = api.base.getById.useQuery({ id: baseId });
  const { newTable, newRows, newCols, handleCreateTable } =
    useDefaultTableSetup(baseId);
  const { data: tables, isLoading: tablesLoading } =
    api.table.getTablesByBase.useQuery({ baseId });

  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [selectedRows, setSelectedRows] = useState<RowType[]>([]);
  const [selectedCols, setSelectedCols] = useState<ColType[]>([]);
  const [createdDefault, setCreatedDefault] = useState(false);

  // Fetch columns and rows for the selected table
  const { data: columns, isLoading: colsLoading } =
    api.table.getColumnsByTable.useQuery(
      { tableId: selectedTable?.id ?? 0 },
      { enabled: !!selectedTable?.id },
    );

  const { data: rowList, isLoading: rowsLoading } =
    api.table.getRowsByTable.useQuery(
      { tableId: selectedTable?.id ?? 0 },
      { enabled: !!selectedTable?.id },
    );

  const isDataLoading = tablesLoading || colsLoading || rowsLoading;

    useEffect(() => {
      createdDefault && newTable && newRows.length === 3 && setSelectedTable(newTable)
      if (createdDefault && newRows) setSelectedRows(newRows);
      if (createdDefault && newCols) setSelectedCols(newCols);
    }, [newTable, newRows, newCols])


  useEffect(() => {
    if (tablesLoading) return;

    if (tables && tables.length === 0 && !createdDefault) {
      handleCreateTable("Table 1");
      setCreatedDefault(true);
    } else if (tables && tables.length > 0 && !selectedTable) {
      setSelectedTable(tables[0]!);
    }
  }, [tablesLoading, tables, selectedTable]);

  useEffect(() => {
    if (columns) setSelectedCols(columns);
    if (rowList) setSelectedRows(rowList);
  }, [columns, rowList]);

  

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Back Sidebar */}
      <div className="flex h-full w-15 flex-col border-r border-gray-200 bg-white pt-2">
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <button className="flex w-full justify-center text-gray-700 hover:bg-gray-100">
              <Image
                src="/airtable-logo-bw.svg"
                alt="Google"
                width={25}
                height={25}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col">
        <div className="flex w-full bg-gray-50 text-sm text-gray-700">
          {/* Header 1 - Untitled Base */}

          <div className="flex h-12 w-full items-center justify-between border-b border-gray-200 bg-white px-4 pt-2 text-sm">
            {/* Left section */}
            <div className="flex items-center">
              <div className="mr-2 rounded bg-blue-900 p-1">
                <Image
                  src="/airtable-logo-white.png"
                  alt="Google"
                  width={20}
                  height={20}
                />
              </div>
              <h1 className="mr-1 text-lg font-bold text-gray-800">
                {base?.name}
              </h1>
              <ChevronDown className="h-4 w-4" />
            </div>

            {/* Middle nav */}
            <div className="ml-10 flex items-center gap-6">
              <button className="border-b-2 border-blue-600 font-medium text-blue-600">
                Data
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                Automations
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                Interfaces
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                Forms
              </button>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <div className="rounded border px-2 py-0.5 text-xs text-gray-500">
                Trial: 13 days left
              </div>
              <button className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
                Launch
              </button>
              <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Header 2  - Table 1, Table 2 */}
        <div className="flex h-10 items-center justify-between border-b border-gray-200 bg-[#f8faff] px-4 text-sm">
          {/* Left section: tables */}
          <div className="flex items-center gap-3">
            {/* Active table */}
            <button className="flex items-center rounded px-2 py-1 font-semibold text-gray-900 hover:bg-gray-100">
              Table 1
              <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
            </button>

            {/* Inactive table */}
            <button className="flex items-center rounded px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              Table 2
              <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-gray-300"></div>

            {/* Add / import */}
            <button className="flex items-center gap-1 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
              <Plus className="h-4 w-4" />
              Add or import
            </button>
          </div>

          {/* Right section: Tools */}
          <button className="flex items-center rounded px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
            Tools
            <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Table Widget */}
        {!isDataLoading &&
          selectedTable &&
          selectedRows.length > 0 &&
          selectedCols.length > 0 && (
            <SelectedTable
              table={selectedTable}
              tableRows={selectedRows}
              tableCols={selectedCols}
            />
          )}
      </div>
    </div>
  );
};
export default AirTable;
