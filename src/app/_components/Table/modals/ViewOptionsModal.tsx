import { Copy, Pencil, Trash } from "lucide-react";
import { useRef, useEffect, type Dispatch, type SetStateAction } from "react";
import { api } from "~/trpc/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCurrView: boolean;
  viewId: number;
  tableId: number;
  setShowRename: Dispatch<SetStateAction<boolean>>;
}

const ViewOptionsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  setShowRename,
  viewId,
  tableId,
  isCurrView,
}) => {
  const utils = api.useUtils();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const deleteView = api.table.deleteView.useMutation({
    onSuccess: async (deleted) => {
      console.log("view delete", deleted);
      await utils.table.getViewByTable.invalidate({ tableId });
      onClose();
    },
  });

  // Close modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return;
  return (
    <div
      ref={modalRef}
      className="absolute left-50 z-50 mt-[-30] w-48 rounded-md border border-gray-200 bg-white shadow-md"
    >
      <button
        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
        onClick={() => {
          setShowRename(true);
          onClose();
        }}
      >
        <Pencil height={18} /> Rename view
      </button>
      <button
        disabled={true}
        className="flex w-full cursor-not-allowed items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
      >
        <Copy height={18} /> Duplicate view
      </button>
      <button
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
        disabled={isCurrView}
        onClick={() => {
          deleteView.mutate({ viewId });
        }}
      >
        <Trash height={18} /> Delete view
      </button>
    </div>
  );
};
export default ViewOptionsModal;
