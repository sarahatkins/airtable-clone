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
    onSuccess: async () => {
      console.log("new filter");
      await utils.table.getFilterCells.invalidate();
    },
  });

  useEffect(() => {
    const update = async () => {
      let newConfig: ViewConfigType | null = null;

      // Update state and capture the full new config
      setConfig((prev) => {
        if (!prev) return prev;

        newConfig = {
          ...prev,
          filters: newFilter,
        };

        onViewChange(newConfig);

        return newConfig;
      });

      // If newConfig is set, call mutation with full updated config
      if (newConfig) {
        try {
          await updateConfig.mutateAsync({
            viewId,
            config: newConfig, // pass full config with filters + unchanged properties
          });
        } catch (error) {
          console.error(error);
        }
      }
    };

    void update();
  }, [newFilter, onViewChange, setConfig, updateConfig, viewId]);

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
