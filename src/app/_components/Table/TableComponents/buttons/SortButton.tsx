import { ArrowDownUp } from "lucide-react";
import SortModal from "../modals/SortModal";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  type SortingType,
  type ColType,
  type ViewConfigType,
} from "~/app/defaults";
import { api } from "~/trpc/react";

interface ButtonProps {
  viewId: number;
  cols: ColType[];
  sorts: SortingType[];
  onViewChange: (param: ViewConfigType) => void;

  setConfig: Dispatch<SetStateAction<ViewConfigType>>;
}

const SortButton: React.FC<ButtonProps> = ({
  viewId,
  cols,
  sorts,
  onViewChange,
  setConfig,
}) => {
  const utils = api.useUtils();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [newSort, setNewSort] = useState<SortingType[]>(sorts);
  const updateConfig = api.table.updateViewConfig.useMutation({
    onSuccess: async () => {
      console.log("new sort");
      await utils.table.getFilterCells.invalidate();
    },
  });

  useEffect(() => {
    const update = async () => {
      let newConfig: ViewConfigType | null = null;

      setConfig((prev) => {
        if (!prev) return prev;

        newConfig = {
          ...prev,
          sorting: newSort,
        };

        onViewChange(newConfig);

        return newConfig;
      });

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
  }, [newSort, onViewChange, setConfig, updateConfig, viewId]);

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
        setSort={setNewSort}
        currentSorts={newSort}
      />
    </div>
  );
};

export default SortButton;
