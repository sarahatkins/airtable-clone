// app/page.tsx
"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import SelectedTable from "./Table/SelectedTable";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useDefaultTableSetup } from "./Table/CreateDefaultTable";
import type { TableType } from "../defaults";
import AddTableButton from "./Table/TableComponents/buttons/AddTableButton";
import SetTableButton from "./Table/TableComponents/buttons/SetTableButton";
import { useRouter } from "next/navigation";

interface AirtableProps {
  baseId: string;
}

/* GOALS
- filtering
- sorting

Extra:
- clean up code
*/

const AirTable: React.FC<AirtableProps> = ({ baseId }) => {
  const router = useRouter();
  const { data: base } = api.base.getById.useQuery({ id: baseId });
  const { newTable, finishedTableSetup, handleCreateTable } =
    useDefaultTableSetup(baseId);
  const { data: tables, isLoading: tablesLoading } =
    api.table.getTablesByBase.useQuery({ baseId });

  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [createdDefault, setCreatedDefault] = useState<boolean>(false);
  const [isTableSetup, setIsTableSetup] = useState<boolean>(true);

  // Fetch columns and rows for the selected table
  useEffect(() => {
    createdDefault && finishedTableSetup && setSelectedTable(newTable);
  }, [newTable, finishedTableSetup]);

  useEffect(() => {
    if (tablesLoading) return;

    if (tables && tables.length === 0 && !createdDefault) {
      handleCreateTable("Table 1");
      setCreatedDefault(true);
    } else if (tables && tables.length > 0 && !selectedTable) {
      setSelectedTable(tables[0]!);
    }
  }, [tablesLoading, tables, selectedTable, createdDefault]);


  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Back Sidebar */}
      <div className="flex h-full w-15 shrink-0 flex-col border-r border-gray-200 bg-white pt-2">
        <div className="flex-1">
          <div className="p-2">
            <button
              className="flex w-full justify-center text-gray-700 hover:bg-gray-100"
              onClick={() => router.replace("/")}
            >
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
            {!tablesLoading &&
              tables &&
              tables.map((t, idx) => (
                <SetTableButton
                  key={idx}
                  setSelectedTable={() => setSelectedTable(t)}
                  name={t.name}
                  tableId={t.id}
                />
              ))}

            {/* Divider */}
            <div className="h-5 w-px bg-gray-300"></div>

            {/* Add / import */}
            <AddTableButton
              baseId={baseId}
              setSelectedTable={setSelectedTable}
              setFinishedTableSetup={setIsTableSetup}
            />
          </div>

          {/* Right section: Tools */}
          <button className="flex items-center rounded px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
            Tools
            <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Table Widget */}
        {!tablesLoading && isTableSetup && selectedTable && (
          <SelectedTable selectedTable={selectedTable} />
        )}
      </div>
    </div>
  );
};
export default AirTable;
