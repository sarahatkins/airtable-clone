import { EyeOff } from "lucide-react";
import {
  type HiddenColType,
  type ColType,
  type ViewConfigType,
} from "~/app/defaults";
import HiddenModal from "../modals/HiddenModal";
import { useState } from "react";

interface ButtonProps {
  cols: ColType[];
  currHiddenCols: HiddenColType[];
  onConfigChange: (newConfig: ViewConfigType) => void;
  viewConfig: ViewConfigType;
}

const HiddenButton: React.FC<ButtonProps> = ({
  cols,
  currHiddenCols,
  onConfigChange,
  viewConfig,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSave = (newHiddenCols: HiddenColType[]) => {
    const newConfig = { ...viewConfig, hiddenColumns: newHiddenCols };
    onConfigChange(newConfig);
  };

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
        onSave={handleSave}
        hiddenCols={currHiddenCols}
      />
    </div>
  );
};

export default HiddenButton;
