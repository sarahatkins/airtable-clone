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
import {
  useState,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { BaseType } from "~/app/defaults";
import { api } from "~/trpc/react";

interface BaseWidgetProps {
  base: BaseType;
  setBases: Dispatch<SetStateAction<BaseType[]>>;
}

const BaseWidget: React.FC<BaseWidgetProps> = ({ base, setBases }) => {
  const utils = api.useUtils();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { data: session } = useSession();

  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [widgetName, setWidgetName] = useState<string>(base.name);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);

  const renameBase = api.base.renameBase.useMutation({
    onSuccess: (renamed) => {
      if (!renamed) return;
      console.log("renamed base", renamed);
    },
  });

  const deleteBase = api.base.deleteBase.useMutation({
    onSuccess: async (renamed) => {
      if (!renamed) return;
      console.log("deleted base", renamed);
      await utils.base.getAll.invalidate({ userId: session?.user.id ?? "" });
    },
  });

  const handleRename = (name: string) => {
    setIsRenaming(false);
    if (!name.trim()) return;

    renameBase.mutate({ id: base.id, name });
    setWidgetName(name);
  };

  const handleDelete = () => {
    setBases((prev) => prev.filter((b) => b.id !== base.id));
    deleteBase.mutate({ id: base.id });
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
      className={`relative flex w-full cursor-pointer items-center gap-3 rounded-md border border-gray-200 bg-white p-4 transition-shadow ${
        hovered ? "bg-white shadow-md" : "bg-gray-50"
      }`}
      onClick={() => {
        if (!menuOpen) router.push(`/${base.id}`);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMenuOpen(false);
      }}
    >
      {/* Icon */}
      <div
        className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-blue-500 font-semibold text-white`}
      >
        {widgetName.replace(/\s/g, "").slice(0, 2)}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <input
          ref={inputRef}
          disabled={!isRenaming}
          onBlur={(e) => handleRename(e.target.value)}
          className="w-40 rounded font-semibold text-gray-900 focus:p-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) => setWidgetName(e.target.value)}
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
              className="cursor-pointer bg-red h-10 rounded p-1 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
            >
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 z-50 mt-[-10] w-60 rounded-md border border-gray-200 bg-white shadow-lg text-sm p-2">
                <ul className="py-1">
                  <li
                    onClick={() => {
                      setIsRenaming(true);
                      setMenuOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <Pencil height={15}/> Rename
                  </li>
                  <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <File height={15}/> Duplicate
                  </li>
                  <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <ArrowRight height={15}/> Move
                  </li>
                  <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <Building height={15}/> Go to workspace
                  </li>
                  <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                    <Paintbrush height={15}/> Customize appearance
                  </li>
                  <li
                    onClick={() => handleDelete()}
                    className="mt-1 flex cursor-pointer items-center gap-2 border-t border-gray-200 px-4 py-2 text-red-700 hover:bg-gray-100"
                  >
                    <Trash height={15} color="gray"/> Delete
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
