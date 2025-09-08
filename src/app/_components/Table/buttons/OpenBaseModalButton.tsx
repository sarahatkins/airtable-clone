import { useState } from "react";
import type { BaseType } from "~/app/defaults";
import EditBaseModal from "../modals/BaseModal";

interface ButtonProps {
  base: BaseType;
}

const OpenBaseModalButton: React.FC<ButtonProps> = ({ base }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [baseName, setBaseName] = useState<string>(base.name);

  return (
    <div className="relative inline-block">
      <button
        className="mr-1 text-[18px] font-semibold text-gray-800 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {baseName}
      </button>

      <EditBaseModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        base={base}
        setBaseName={setBaseName}
      />
    </div>
  );
};

export default OpenBaseModalButton;
