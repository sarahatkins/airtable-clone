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
import Image from "next/image";
import SelectedTable from "./Table/Table";

const AirTable = () => {
  const [rows] = useState([
    { id: 1, name: "", notes: "", assignee: "", status: "", attachments: "" },
    { id: 2, name: "", notes: "", assignee: "", status: "", attachments: "" },
    { id: 3, name: "", notes: "", assignee: "", status: "", attachments: "" },
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Back Sidebar */}
      <div className="flex h-full w-15 flex-col border-r border-gray-200 bg-white pt-2">
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <button className="flex w-full justify-center  text-gray-700 hover:bg-gray-100">
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

          <div className="flex h-12 w-full items-center pt-2 justify-between border-b border-gray-200 bg-white px-4 text-sm">
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
                Untitled Base
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
        <SelectedTable />
      </div>
    </div>
  );
};
export default AirTable;
