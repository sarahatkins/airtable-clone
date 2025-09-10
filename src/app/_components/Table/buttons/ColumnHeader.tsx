// components/HeaderCell.tsx
import {
  ArrowLeft,
  ArrowRight,
  Baseline,
  Copy,
  Hash,
  Pencil,
  Trash,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import RenameColModal from "../RenameColModal";

interface HeaderProps {
  title: string;
  type: string;
  tableId: number;
  colId: number;
}

const ColumnHeader: React.FC<HeaderProps> = ({
  title,
  type,
  colId,
  tableId,
}) => {
  const utils = api.useUtils();
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [columnName, setColumnName] = useState<string>(title);
  const [showRename, setShowRename] = useState<boolean>(false);

  const deleteColumn = api.table.deleteColumn.useMutation({
    onSuccess: async (renamed) => {
      if (!renamed) return;
      console.log("deleted base", renamed);
      await utils.table.getColumnsByTable.invalidate({ tableId });
      setContextMenu(null);
    },
  });

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setShowRename(false);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      className="cursor-context-menu py-1 select-none h-6"
    >
      <div className="flex items-center h-full text-sm">
        {type === "text" ? (
          <Baseline width={13} className="mr-1 mt-0.25" />
        ) : (
          <Hash width={13} className="mr-1" />
        )}
        {columnName}
      </div>

      {contextMenu && !showRename && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-56 rounded-md border border-gray-200 bg-white shadow-lg"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <ul className="text-sm text-gray-700">
            <li
              className="flex cursor-pointer items-center px-4 py-2 hover:bg-gray-100"
              onClick={() => setShowRename(true)}
            >
              <Pencil height={15} className="mr-2" />
              Edit field
            </li>
            <li className="center flex cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
              <Copy height={15} className="mr-2" />
              Duplicate field
            </li>
            <li className="center flex cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
              <ArrowLeft height={15} className="mr-2" />
              Insert left
            </li>
            <li className="center flex cursor-not-allowed px-4 py-2 text-gray-400 hover:bg-gray-100">
              <ArrowRight height={15} className="mr-2" />
              Insert right
            </li>
            <li
              className="flex cursor-pointer items-center px-4 py-2 hover:bg-gray-100"
              onClick={() => deleteColumn.mutate({ columnId: colId })}
            >
              <Trash height={15} className="mr-2" />
              Delete field
            </li>
          </ul>
        </div>
      )}

      <RenameColModal
        open={showRename}
        colId={colId}
        onClose={() => {
          setShowRename(false);
          setContextMenu(null);
        }}
        currName={columnName}
        colType={type}
        setModalName={setColumnName}
      />
    </div>
  );
};

export default ColumnHeader;
