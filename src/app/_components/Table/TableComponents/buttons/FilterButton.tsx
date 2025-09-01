import { Filter } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import FilterModal from "../modals/FilterModal";
import type { ColType, FilterType, ViewConfigType } from "~/app/defaults";

interface ButtonProps {
  tableId: number;
  cols: ColType[];
  filter: FilterType[];
  setConfig: Dispatch<SetStateAction<ViewConfigType>>;
}

const FilterButton: React.FC<ButtonProps> = ({
  tableId,
  cols,
  filter,
  setConfig,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newFilter, setNewFilter] = useState<FilterType[]>(filter);

  useEffect(() => {
    console.log("NEW FILTER ALERT",newFilter)
    setConfig((prev) => ({ ...prev, filters: newFilter }));
  }, [newFilter]);

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
        tableId={tableId}
        cols={cols}
        currentFilter={newFilter}
        setFilter={setNewFilter}
      />
    </div>
  );
};

export default FilterButton;
