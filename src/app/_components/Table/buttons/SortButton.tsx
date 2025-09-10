import { ArrowDownUp } from "lucide-react";
import SortModal from "../modals/SortModal";
import { useState } from "react";
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

 const handleSave = (newSort: SortingType[]) => {
    const newConfig: ViewConfigType = { ...viewConfig, sorting: newSort };
    console.log("SAVING", newConfig);
    onConfigChange(newConfig);
  };
  return (
    <div className="relative inline-block">
      <button
        className="flex cursor-pointer items-center gap-1 hover:text-gray-900"
        onClick={() => setModalOpen(true)}
      >
        <ArrowDownUp className="h-4 w-4" /> Sort
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
