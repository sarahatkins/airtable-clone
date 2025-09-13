import { EyeOff } from "lucide-react";
import {
  type HiddenColType,
  type ColType,
  type ViewConfigType,
} from "~/app/defaults";
import HiddenModal from "../modals/HiddenModal";
import { useMemo, useState } from "react";

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
  const isHidingCols: boolean = useMemo(() => {
    return currHiddenCols.length > 0;
  }, [currHiddenCols]);
  const handleSave = (newHiddenCols: HiddenColType[]) => {
    const newConfig = { ...viewConfig, hiddenColumns: newHiddenCols };
    onConfigChange(newConfig);
  };

  return (
    <div
      className={`relative inline-block  ${isHidingCols ? "bg-blue-200 hover:ring hover:ring-gray-300" : "hover:bg-gray-100"} rounded-sm py-1 px-2`}
    >
      <button
        className={`flex cursor-pointer items-center gap-1`}
        onClick={() => setIsOpen(true)}
      >
        <EyeOff className="h-4 w-4" />{" "}
        {isHidingCols
          ? `${currHiddenCols.length} hidden field${currHiddenCols.length > 1 ? "s" : ""}`
          : "Hide fields"}
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
