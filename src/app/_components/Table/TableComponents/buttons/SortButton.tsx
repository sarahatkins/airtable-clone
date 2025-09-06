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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [newSort, setNewSort] = useState<SortingType[]>(sorts);
  const updateConfig = api.table.updateViewConfig.useMutation({
    onSuccess: () => {
      console.log("new sort");
    },
  });

  useEffect(() => {
    setConfig((prev) => {
      const newConfig = { ...prev, sorting: newSort };

      updateConfig.mutate({
        viewId,
        config: newConfig,
      });

      onViewChange(newConfig);
      return newConfig;
    });
  }, [newSort]);

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
