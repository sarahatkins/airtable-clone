import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import FilterModal from "../modals/FilterModal";
import type { ColType, ViewConfigType, FilterGroup } from "~/app/defaults";

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
  const isFiltering: boolean = useMemo(() => {
    if (!currFilter) return false;
    if (!currFilter.args) return false;

    return currFilter.args.length > 0;
  }, [currFilter]);

  const handleSave = (filters: FilterGroup | null) => {
    const newConfig: ViewConfigType = { ...viewConfig, filters };
    onConfigChange(newConfig);
  };

  return (
    <div
      className={`relative inline-block ${isFiltering ? "bg-green-200 hover:ring hover:ring-gray-300" : "hover:bg-gray-100"} rounded-sm px-2 py-1`}
    >
      <button
        className="flex cursor-pointer items-center gap-1"
        onClick={() => setShowModal(true)}
      >
        <Filter className="h-4 w-4" />{" "}
        {isFiltering
          ? `Filtered by ${currFilter?.args?.length ?? 0} field${
              currFilter?.args && currFilter.args.length > 1 ? "s" : ""
            }`
          : "Filter"}
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
