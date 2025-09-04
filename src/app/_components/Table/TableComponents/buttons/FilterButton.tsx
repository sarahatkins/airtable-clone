import { Filter } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import FilterModal from "../modals/FilterModal";
import type { ColType, FilterType, ViewConfigType } from "~/app/defaults";
import { api } from "~/trpc/react";

interface ButtonProps {
  cols: ColType[];
  viewId: number;
  filter: FilterType[];
  setConfig: Dispatch<SetStateAction<ViewConfigType>>;
}

const FilterButton: React.FC<ButtonProps> = ({
  cols,
  filter,
  viewId,
  setConfig,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newFilter, setNewFilter] = useState<FilterType[]>(filter);
  const updateConfig = api.table.updateViewConfig.useMutation({
    onSuccess: () => {
      console.log("new filter");
    },
  });

  useEffect(() => {
    setConfig((prev) => {
      const newConfig = { ...prev, filters: newFilter };

      updateConfig.mutate({
        viewId,
        config: newConfig,
      });

      return newConfig;
    });
  }, [newFilter, setConfig, updateConfig, viewId]);

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
        currentFilter={newFilter}
        setFilter={setNewFilter}
      />
    </div>
  );
};

export default FilterButton;
