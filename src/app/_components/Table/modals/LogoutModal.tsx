// components/SortModal.tsx
import { useEffect, useRef } from "react";
import {  LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LougoutModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const {data: session} = useSession();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute right-5 z-60 mt-2 w-[380px] rounded-lg border border-gray-200 bg-white shadow-xl p-5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{session?.user.name}</h3>
        <p className="text-sm text-gray-600">
          {session?.user.email}
        </p>
      </div>

      <div className="border-b border-gray-100 mb-1"></div>

      <div className="space-y-2">
        <div className="flex cursor-pointer items-center rounded px-2 py-2 hover:bg-gray-100 space-x-3 text-sm text-gray-800" onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
        </div>
      </div>
    </div>
  );
};

export default LougoutModal;
