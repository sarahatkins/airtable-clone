import { EyeOff } from "lucide-react";
import {
  type HiddenColType,
  type ColType,
  type ViewConfigType,
} from "~/app/defaults";
import HiddenModal from "../modals/HiddenModal";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { api } from "~/trpc/react";

interface ButtonProps {
  viewId: number;
  cols: ColType[];
  currHiddenCols: HiddenColType[];
  setConfig: Dispatch<SetStateAction<ViewConfigType>>;
}

const HiddenButton: React.FC<ButtonProps> = ({
  cols,
  viewId,
  currHiddenCols,
  setConfig,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hiddenColumns, setHiddenColumns] =
    useState<HiddenColType[]>(currHiddenCols);
  const utils = api.useUtils();

  const updateConfig = api.table.updateViewConfig.useMutation({
    onSuccess: () => {
      console.log("changed hidden columns");
      utils.table.getFilterCells.invalidate();
    },
  });

  useEffect(() => {
    setConfig((prev) => {
      const newConfig = { ...prev, hiddenColumns };

      updateConfig.mutate({
        viewId,
        config: newConfig,
      });

      return newConfig;
    });
  }, [hiddenColumns]);

  return (
    <div className="relative inline-block">
      <button className="flex items-center gap-1 hover:text-gray-900 cursor-pointer" onClick={() => setIsOpen(true)}>
        <EyeOff className="h-4 w-4" /> Hide fields
      </button>

      <HiddenModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        cols={cols}
        onSelect={setHiddenColumns}
        hiddenCols={hiddenColumns}
      />
    </div>
  );
};

export default HiddenButton;
