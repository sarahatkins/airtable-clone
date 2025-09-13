import { ArrowDownUp } from "lucide-react";
import SortModal from "../modals/SortModal";
import { useMemo, useState } from "react";
import {
  type SortingType,
  type ColType,
  type ViewConfigType,
} from "~/app/defaults";

interface ButtonProps {
  cols: ColType[];
  currSorts: SortingType[];
  onConfigChange: (newConfig: ViewConfigType) => void;
  viewConfig: ViewConfigType;
}

const SortButton: React.FC<ButtonProps> = ({
  cols,
  currSorts,
  onConfigChange,
  viewConfig,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const isSorting = useMemo(() => {
    return currSorts.length > 0;
  }, [currSorts]);

  const handleSave = (newSort: SortingType[]) => {
    const newConfig: ViewConfigType = { ...viewConfig, sorting: newSort };
    onConfigChange(newConfig);
  };
  return (
    <div
      className={`relative inline-block ${isSorting ? "bg-orange-200 hover:ring hover:ring-gray-300" : "hover:bg-gray-100"} rounded-sm px-2 py-1`}
    >
      <button
        className="flex cursor-pointer items-center gap-1 hover:text-gray-900"
        onClick={() => setModalOpen(true)}
      >
        <ArrowDownUp className="h-4 w-4" />{" "}
        {isSorting
          ? `Sorted by ${currSorts.length} field${currSorts.length > 1 ? "s" : ""}`
          : "Sort"}
      </button>

      <SortModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cols={cols}
        onSave={handleSave}
        currentSorts={currSorts}
      />
    </div>
  );
};

export default SortButton;
