import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type React from "react";
import type { ViewType } from "~/app/defaults";
import ViewNameModal from "../modals/ViewNameModal";

interface ButtonProps {
  view: ViewType;
  selected: boolean;
  setSelectedView: Dispatch<SetStateAction<ViewType | null>>;
}

const GridViewButton: React.FC<ButtonProps> = ({
  view,
  selected,
  setSelectedView,
}) => {
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowRenameModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        setShowRenameModal(true);
      }}
    >
      <button
        className={`flex w-full items-center ${selected ? "bg-gray-100" : "bg-transparent"} cursor-pointer px-3 py-2 font-medium text-black hover:bg-gray-100`}
        onClick={() => setSelectedView(view)}
      >
        {view.name}
      </button>
      <ViewNameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        tableId={view.tableId}
        currentName={view.name}
      />
    </div>
  );
};

export default GridViewButton;
