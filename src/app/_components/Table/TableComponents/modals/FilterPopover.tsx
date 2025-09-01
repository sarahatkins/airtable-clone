"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import type { ColumnFilter } from "@tanstack/react-table";

interface FilterPopoverProps {
  columnFilters: ColumnFilter[];
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
}

interface StatusItemProps {
  status: { id: string; name: string; color: string };
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  isActive: boolean;
}

const StatusItem: React.FC<StatusItemProps> = ({ status, setColumnFilters, isActive }) => {
  return (
    <div
      className={`flex items-center cursor-pointer rounded-md font-semibold px-2 py-1.5 text-sm transition-colors ${
        isActive ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
      }`}
      onClick={() =>
        setColumnFilters((prev) => {
          const statuses = prev.find((filter) => filter.id === "status")?.value as string[] | undefined;
          if (!statuses) {
            return prev.concat({
              id: "status",
              value: [status.id],
            });
          }

          return prev.map((f) =>
            f.id === "status"
              ? {
                  ...f,
                  value: isActive
                    ? statuses.filter((s) => s !== status.id)
                    : statuses.concat(status.id),
                }
              : f
          );
        })
      }
    >
      {status.name}
    </div>
  );
};

const FilterPopover: React.FC<FilterPopoverProps> = ({ columnFilters, setColumnFilters }) => {
  const [open, setOpen] = useState(false);
  const filterStatuses = (columnFilters.find((f) => f.id === "status")?.value as string[]) || [];

  return (
    <div className="relative inline-block text-left">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm ${
          filterStatuses.length > 0
            ? "text-blue-500 border-blue-500"
            : "border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Filter className="mr-2 h-4 w-4" />
        Filter
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-10">
          <div className="p-4">
            <p className="text-sm font-bold mb-2">Filter By:</p>
            <p className="text-xs font-semibold text-gray-500 mb-1">Status</p>
            <div className="flex flex-col gap-1">
              {/* {STATUSES.map((status) => (
                <StatusItem
                  key={status.id}
                  status={status}
                  isActive={filterStatuses.includes(status.id)}
                  setColumnFilters={setColumnFilters}
                />
              ))} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPopover;
