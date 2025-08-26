// app/page.tsx
"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  User,
  FileText,
  CheckCircle,
} from "lucide-react";

const TableMenu = () => {

  return (
    <div className="flex w-60 flex-col h-full border-r border-gray-200 bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <button className="flex w-full items-center rounded-md px-2 py-1.5 text-gray-700 hover:bg-gray-100">
            <Plus className="mr-2 h-4 w-4" />
            Create new...
          </button>
          <div className="mt-2 flex items-center px-2 py-1.5 text-sm text-gray-500">
            <Search className="mr-2 h-4 w-4" />
            Find a view
          </div>
        </div>
        <div className="mt-4">
          <button className="flex w-full items-center bg-blue-50 px-3 py-2 font-medium text-blue-600">
            Grid view
          </button>
        </div>
      </div>
    </div>
  );
};
export default TableMenu;
