import type React from "react";
import type { ViewType } from "~/app/defaults";

interface ButtonProps {
  view: ViewType;
  selected: boolean;
  setSelectedView: any;
}

const GridViewButton: React.FC<ButtonProps> = ({ view, selected, setSelectedView }) => {
  return (
    <button className={`flex w-full items-center ${selected ? "bg-gray-100" : "bg-transparent"} px-3 py-2 font-medium text-black cursor-pointer hover:bg-gray-100`} onClick={() => setSelectedView(view)}>
      {view.name}
    </button>
  );
};

export default GridViewButton;
