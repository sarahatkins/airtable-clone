import React, { type ReactNode } from 'react';

type MenuItemProps = {
  icon: ReactNode;
  label: string;
  textColor?: string;
  onClick?: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, textColor = 'text-gray-800', onClick }) => {
  return (
    <li className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100" onClick={onClick}>
      <span className="text-gray-500">{icon}</span>
      <span className={`flex-1 ${textColor}`}>{label}</span>
    </li>
  );
}

export default MenuItem;