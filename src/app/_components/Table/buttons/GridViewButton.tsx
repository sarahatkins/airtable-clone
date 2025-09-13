import { useState, type Dispatch, type SetStateAction } from "react";
import type React from "react";
import type { ViewType } from "~/app/defaults";
import ViewNameModal from "../modals/ViewNameModal";
import ViewOptionsModal from "../modals/ViewOptionsModal";
import { Table2 } from "lucide-react";
import { api } from "~/trpc/react";

interface ButtonProps {
  view: ViewType;
  selected: boolean;
  setSelectedView: Dispatch<SetStateAction<ViewType | null>>;
}

const GridViewButton: React.FC<ButtonProps> = ({
  view,
  selected,
  setSelectedView,
}) => {
  const utils = api.useUtils();
  const [viewName, setViewName] = useState<string>(view.name);
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        setShowOptionsModal(true);
      }}
    >
      <button
        className={`flex w-full items-center ${selected ? "bg-gray-100" : "bg-transparent"} cursor-pointer px-3 py-2 text-xs font-medium text-black hover:bg-gray-100`}
        onClick={() => {
          setSelectedView(view);
          // utils.table.getFilterCells.invalidate();
        }}
      >
        <Table2 width={15} className="mr-1 text-blue-600" />
        {viewName}
      </button>

      <ViewOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        viewId={view.id}
        tableId={view.tableId}
        setShowRename={setShowRenameModal}
        isCurrView={selected}
      />

      <ViewNameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        tableId={view.tableId}
        currentName={view.name}
        isNewView={false}
        viewId={view.id}
        setButtonName={setViewName}
      />
    </div>
  );
};

export default GridViewButton;
