import { Filter } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import FilterModal from "../modals/FilterModal";
import type { ColType, ViewConfigType, FilterGroup } from "~/app/defaults";
import { api } from "~/trpc/react";

interface ButtonProps {
  cols: ColType[];
  currFilter: FilterGroup | null;
  onConfigChange: (newConfig: ViewConfigType) => void;
  viewConfig: ViewConfigType;
}

const FilterButton: React.FC<ButtonProps> = ({
  cols,
  currFilter,
  onConfigChange,
  viewConfig,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleSave = (filters: FilterGroup | null) => {
    const newConfig: ViewConfigType = { ...viewConfig, filters };
    onConfigChange(newConfig);
  };

  return (
    <div className="relative inline-block">
      <button
        className="flex cursor-pointer items-center gap-1 hover:text-gray-900"
        onClick={() => setShowModal(true)}
      >
        <Filter className="h-4 w-4" /> Filter
      </button>

      {/* Modal content */}
      <FilterModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        cols={cols}
        currentFilter={currFilter}
        onSave={handleSave}
      />
    </div>
  );
};

export default FilterButton;
