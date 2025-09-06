import { Filter } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import FilterModal from "../modals/FilterModal";
import type { ColType, ViewConfigType, FilterGroup } from "~/app/defaults";
import { api } from "~/trpc/react";

interface ButtonProps {
  cols: ColType[];
  viewId: number;
  filter: FilterGroup | null;
  onViewChange: (param: ViewConfigType) => void;
  setConfig: Dispatch<SetStateAction<ViewConfigType>>;
}

const FilterButton: React.FC<ButtonProps> = ({
  cols,
  filter,
  viewId,
  onViewChange,
  setConfig,
}) => {
  const utils = api.useUtils();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newFilter, setNewFilter] = useState<FilterGroup | null>(filter);
  const updateConfig = api.table.updateViewConfig.useMutation({
    onSuccess: () => {
      console.log("new filter");
      utils.table.getFilterCells.invalidate();
    },
  });

  useEffect(() => {
    setConfig((prev) => {
      const newConfig = { ...prev, filters: newFilter };

      updateConfig.mutate({
        viewId,
        config: {
          filters: newFilter ?? undefined,
          sorting: newConfig.sorting,
          hiddenColumns: newConfig.hiddenColumns,
        },
      });
      onViewChange(newConfig);
      return newConfig;
    });
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
        cols={cols}
        currentFilter={newFilter}
        setFilter={setNewFilter}
      />
    </div>
  );
};

export default FilterButton;
