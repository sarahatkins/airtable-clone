"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { ColumnFilter } from "@tanstack/react-table";
import FilterPopover from "./modals/FilterPopover";

interface TableFiltersProps {
  columnFilters: ColumnFilter[];
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
}

const TableFilters: React.FC<TableFiltersProps> = ({
  columnFilters,
  setColumnFilters,
}) => {
  const [taskName, setTaskName] = useState<any>("");

  // whenever columnFilters change externally, sync input
  useEffect(() => {
    const existing = columnFilters.find((f) => f.id === "Name")?.value || "";
    setTaskName(existing);
  }, [columnFilters]);

  const onFilterChange = (id: string , value: string) => {
    setTaskName(value);
    setColumnFilters((prev) => [
      ...prev.filter((f) => f.id !== id),
      { id, value },
    ]);
  };

  return (
    <div className="mb-6 flex items-center gap-3">
      {/* Search Input */}

      <div className="relative w-48">
        <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Task name"
          className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pr-3 pl-8 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none"
          value={taskName}
          onChange={(e) => onFilterChange("Name", e.target.value)}
        />
      </div>

      {/* Custom FilterPopover component */}
      <FilterPopover
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
    </div>
  );
};

export default TableFilters;
