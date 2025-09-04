import type React from "react";
import {
  Home,
  Star,
  Users,
  Share2,
  BookOpen,
  Import,
  ShoppingBag,
} from "lucide-react";
import CreateBaseButton from "./CreateBaseButton";

interface SidebarProps {
  expanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded }) => {
  return (
    <aside
      className={`flex flex-col border-r border-gray-300 bg-white transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <nav className="flex-1 space-y-2 p-4">
        <button className="flex w-full items-center rounded-lg px-3 py-2 hover:bg-gray-100">
          <Home className="h-5 w-5" />
          {expanded && <span className="ml-2">Home</span>}
        </button>
        <button className="flex w-full items-center rounded-lg px-3 py-2 hover:bg-gray-100">
          <Star className="h-5 w-5" />
          {expanded && <span className="ml-2">Starred</span>}
        </button>
        <button className="flex w-full items-center rounded-lg px-3 py-2 hover:bg-gray-100">
          <Share2 className="h-5 w-5" />
          {expanded && <span className="ml-2">Shared</span>}
        </button>
        <button className="flex w-full items-center rounded-lg px-3 py-2 hover:bg-gray-100">
          <Users className="h-5 w-5" />
          {expanded && <span className="ml-2">Workspaces</span>}
        </button>
      </nav>

      <div className="flex items-center justify-between pr-6 pl-6">
        <hr className="w-full border-gray-300" />
      </div>

      <div className="pt-4 pr-4 pb-1 pl-4">
        <button className="flex w-full items-center rounded-lg px-3 py-2 text-xs hover:bg-gray-100">
          <BookOpen className="h-3.5 w-3.5" />
          {expanded && <span className="ml-2">Shared</span>}
        </button>
        <button className="flex w-full items-center rounded-lg px-3 py-2 text-xs hover:bg-gray-100">
          <ShoppingBag className="h-3.5 w-3.5" />
          {expanded && <span className="ml-2">Marketplace</span>}
        </button>
        <button className="flex w-full items-center rounded-lg px-3 py-2 text-xs hover:bg-gray-100">
          <Import className="h-3.5 w-3.5" />
          {expanded && <span className="ml-2">Import</span>}
        </button>
      </div>

      <div className="p-4">
        <CreateBaseButton expanded={expanded} />
      </div>
    </aside>
  );
};

export default Sidebar;
