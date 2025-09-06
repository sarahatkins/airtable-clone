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
  onViewChange: (param: ViewConfigType) => void;
  setConfig: Dispatch<SetStateAction<ViewConfigType>>;
}

const HiddenButton: React.FC<ButtonProps> = ({
  cols,
  viewId,
  currHiddenCols,
  onViewChange,
  setConfig,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hiddenColumns, setHiddenColumns] =
    useState<HiddenColType[]>(currHiddenCols);
  const utils = api.useUtils();

  const updateConfig = api.table.updateViewConfig.useMutation({
    onSuccess: async () => {
      console.log("changed hidden columns");
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
          hiddenColumns,
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
  }, [hiddenColumns, onViewChange, setConfig, updateConfig, viewId]);

  return (
    <div className="relative inline-block">
      <button
        className="flex cursor-pointer items-center gap-1 hover:text-gray-900"
        onClick={() => setIsOpen(true)}
      >
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
