import type { InferSelectModel } from "drizzle-orm";
import {
  Database,
  Star,
  MoreHorizontal,
  Pencil,
  File,
  ArrowRight,
  Building,
  Paintbrush,
  Trash,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { bases } from "~/server/db/schemas/tableSchema";
import { api } from "~/trpc/react";

type Base = InferSelectModel<typeof bases>;

interface BaseWidgetProps {
  base: Base;
}

const BaseWidget: React.FC<BaseWidgetProps> = ({ base }) => {
  const utils = api.useUtils();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [widgetName, setWidgetName] = useState<string>(base.name);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const renameBase = api.base.renameBase.useMutation({
    onSuccess: (renamed) => {
      if (!renamed) return;
      console.log("renamed base", renamed);
    },
  });

  const deleteBase = api.base.deleteBase.useMutation({
    onSuccess: (renamed) => {
      if (!renamed) return;
      console.log("deleted base", renamed);
      utils.base.getAll.invalidate({ userId: session?.user.id ?? "" });
    },
  });

  const handleRename = (name: string) => {
    setIsRenaming(false);
    if (!name.trim()) return;

    renameBase.mutate({ id: base.id, name });
    setWidgetName(name);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  return (
    <div
      className={`relative flex w-75 cursor-pointer items-center gap-3 rounded-md border border-gray-200 bg-white p-4 transition-shadow ${
        hovered ? "bg-white shadow-md" : "bg-gray-50"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMenuOpen(false); // close menu on mouse leave
      }}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 font-semibold text-white`}
      >
        {widgetName.replace(/\s/g, "").slice(0, 2)}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <input
          ref={inputRef}
          readOnly={!isRenaming}
          onBlur={(e) => handleRename(e.target.value)}
          className="focus:outline-none focus:p-1 focus:ring-2 focus:ring-blue-500 rounded w-35 font-semibold text-gray-900"
          value={widgetName}
        />
        {!hovered && (
          <span className="text-sm text-gray-500">Opened 15 minutes ago</span>
        )}
        {hovered && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Database className="h-4 w-4" />
            <span>Open data</span>
          </div>
        )}
      </div>

      {/* Right icons on hover */}
      {hovered && (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            aria-label="Star"
            className="text-gray-400 hover:text-yellow-400"
          >
            <Star className="h-5 w-5" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="More options"
              className="rounded p-1 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </button>

            {menuOpen && (
              <div className="absolute top-full right-[-200] z-50 mt-[-20] w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                <ul className="py-1">
                  <li
                    onClick={() => {
                      setIsRenaming(true);
                      setMenuOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <Pencil /> Rename
                  </li>
                  <li className="flex cursor-not-allowed items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <File /> Duplicate
                  </li>
                  <li className="flex cursor-not-allowed items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <ArrowRight /> Move
                  </li>
                  <li className="flex cursor-not-allowed items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <Building /> Go to workspace
                  </li>
                  <li className="flex cursor-not-allowed items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <Paintbrush /> Customize appearance
                  </li>
                  <li
                    onClick={() => deleteBase.mutate({ id: base.id })}
                    className="mt-1 flex cursor-pointer items-center gap-2 border-t border-gray-200 px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    <Trash /> Delete
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default BaseWidget;
