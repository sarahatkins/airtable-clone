import { Search } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import SearchViewModal from "../modals/SearchViewModal";

interface ButtonProps {
  setSearch: Dispatch<SetStateAction<string | undefined>>;
}

const SearchViewButton: React.FC<ButtonProps> = ({
  setSearch,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <div >
      <button className="cursor-pointer rounded p-1 hover:bg-gray-100" onClick={() => setModalOpen(true)}>
        <Search className="h-5 w-5" />
      </button>

      <SearchViewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        setSearch={setSearch}
      />
    </div>
  );
};

export default SearchViewButton;
