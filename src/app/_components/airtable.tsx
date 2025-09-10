"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import type { TableType } from "../defaults";
import AddTableButton from "./Table/buttons/AddTableButton";
import SetTableButton from "./Table/buttons/SetTableButton";
import SelectedTable from "./Table/SelectedTable";
import LoadingScreen from "./Table/LoadingScreen";
import { ChevronDown } from "lucide-react";

interface AirtableProps {
  baseId: string;
  tableId: string;
}

const AirTable: React.FC<AirtableProps> = ({ baseId, tableId }) => {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [isTableSetup, setIsTableSetup] = useState<boolean>(true);
  const { data: tables, isLoading } = api.table.getTablesByBase.useQuery({
    baseId: baseId,
  });

  useEffect(() => {
    if (!isLoading && tables) {
      const table = tables.find((t) => t.id === Number(tableId));
      if (table) {
        setSelectedTable(table);
      }
    }
  }, [isLoading, tables, tableId]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header 2: Table list */}
      <div className="flex h-7.5 items-center justify-between border-b border-gray-200 bg-indigo-50 pr-4 text-sm">
        <div className="flex h-full items-center">
          {!isLoading &&
            tables?.map((t) => {
              if (!t.id) return;

              return (
                <SetTableButton
                  key={t.id}
                  selected={Number(tableId) === t.id}
                  baseId={baseId}
                  setSelectedTable={() => router.push(`/${baseId}/${t.id}`)}
                  name={t.name}
                  tableId={t.id}
                />
              );
            })}

          <ChevronDown height={18} className="mt-0.5 text-gray-700" />
          <AddTableButton
            baseId={baseId}
            setSelectedTable={setSelectedTable}
            setFinishedTableSetup={setIsTableSetup}
          />
        </div>

        <button className="flex items-center rounded px-2 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800">
          Tools
        </button>
      </div>

      {/* Table content */}

      <div className="h-full">
        {(isLoading || !isTableSetup) && <LoadingScreen />}
        <div className="h-full w-full">
          {!isLoading && isTableSetup && selectedTable && (
            <SelectedTable selectedTable={selectedTable} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AirTable;
