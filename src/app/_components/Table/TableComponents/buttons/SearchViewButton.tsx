import { Search } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import SearchViewModal from "../modals/SearchViewModal";

interface ButtonProps {
  search: string | undefined;
  setSearch: Dispatch<SetStateAction<string | undefined>>;
}

const SearchViewButton: React.FC<ButtonProps> = ({
  search,
  setSearch,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <div className="relative inline-block">
      <button className="cursor-pointer rounded p-1 hover:bg-gray-100" onClick={() => setModalOpen(true)}>
        <Search className="h-5 w-5" />
      </button>

      <SearchViewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        setSearch={setSearch}
        currentSearch={search}
      />
    </div>
  );
};

export default SearchViewButton;
