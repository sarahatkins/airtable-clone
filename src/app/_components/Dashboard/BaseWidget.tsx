import { type LucideIcon } from "lucide-react";


interface WidgetProps {
  name: string;
  desc: string;
  icon: LucideIcon;
  color:string;
}
import type React from "react";

const BaseWidget: React.FC<WidgetProps> = ({name, desc, icon: Icon, color}) => {
  return (
    <div className="cursor-pointer items-start space-x-3 rounded-lg bg-white p-4  border border-gray-300 hover:shadow-2xl">
      {/* Icon */}
      <div className="flex items-center mb-1">
        <Icon className={`h-4 w-4 text-${color}`} />
        <p className="font-semibold pl-2 text-sm">{name}</p>
      </div>
      <div className="text-xs text-gray-500">
        {desc}
      </div>
    </div>
  );
};
export default BaseWidget;
