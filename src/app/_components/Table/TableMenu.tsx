// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  User,
  FileText,
  CheckCircle,
} from "lucide-react";
import CreateViewButton from "./TableComponents/buttons/CreateViewButton";
import GridViewButton from "./TableComponents/buttons/GridViewButton";
import { api } from "~/trpc/react";

interface MenuProps {
  tableId: number;
}

const TableMenu: React.FC<MenuProps> = ({ tableId }) => {
  const [selectedView, setSelectedView] = useState<number>(0);
  const { data: views, isLoading: viewsLoading } =
    api.table.getViewByTable.useQuery({ tableId });

  useEffect(() => {
    if (viewsLoading) return;
    if (!views) return;

    setSelectedView(views[0]?.id!);
  }, [views, viewsLoading]);

  return (
    <div className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <CreateViewButton tableId={tableId} />
          <div className="mt-2 flex items-center px-2 py-1.5 text-sm text-gray-500">
            <Search className="mr-2 h-4 w-4" />
            Find a view
          </div>
        </div>
        <div className="mt-4">
          {!viewsLoading &&
            views &&
            views.map((v) => {
              return (
                <GridViewButton
                  key={v.id}
                  view={v}
                  selected={v.id === selectedView}
                  setSelectedView={setSelectedView}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};
export default TableMenu;
