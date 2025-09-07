"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import type { TableType } from "../defaults";
import AddTableButton from "./Table/buttons/AddTableButton";
import SetTableButton from "./Table/buttons/SetTableButton";
import SelectedTable from "./Table/SelectedTable";

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
    <div className="flex flex-col h-full">
      {/* Header 2: Table list */}
      <div className="flex h-10 items-center justify-between border-b border-gray-200 bg-[#f8faff] px-4 text-sm">
        <div className="flex items-center gap-3">
          {!isLoading &&
            tables?.map((t) => (
              <SetTableButton
                key={t.id}
                setSelectedTable={() => router.push(`/${baseId}/${t.id}`)}
                name={t.name}
              />
            ))}

          <div className="h-5 w-px bg-gray-300"></div>

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
      <div className="flex-1 min-h-0">
        {!isLoading && isTableSetup && selectedTable && (
          <SelectedTable selectedTable={selectedTable} />
        )}
      </div>
    </div>
  );
};

export default AirTable;
