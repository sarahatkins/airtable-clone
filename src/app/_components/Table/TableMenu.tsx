// app/page.tsx
"use client";

import { type Dispatch, type SetStateAction } from "react";
import { Search } from "lucide-react";
import CreateViewButton from "./buttons/CreateViewButton";
import GridViewButton from "./buttons/GridViewButton";
import type { ViewType } from "~/app/defaults";

interface MenuProps {
  tableId: number;
  views: ViewType[];
  selectedView: ViewType;
  setSelectedView: Dispatch<SetStateAction<ViewType | null>>;
}

const TableMenu: React.FC<MenuProps> = ({
  tableId,
  views,
  selectedView,
  setSelectedView,
}) => {
  return (
    <div className="flex h-full w-66 shrink-0 flex-col border-r border-gray-200 bg-white p-2">
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <CreateViewButton tableId={tableId} />
          <div className="mt-2 flex items-center px-2 py-1.5 text-xs text-gray-500">
            <Search className="mr-2 h-4 w-4" />
            Find a view
          </div>
        </div>
        <div>
          {views.map((v) => {
            return (
              <GridViewButton
                key={v.id}
                view={v}
                selected={v.id === selectedView.id}
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
