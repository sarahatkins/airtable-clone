import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

interface ButtonProps {
  expanded: boolean;
}

const CreateBaseButton: React.FC<ButtonProps> = ({ expanded }) => {
  const router = useRouter();

  const createBase = api.base.create.useMutation({
    onSuccess: (newBase) => {
      router.push(`/${newBase?.id}`);
    },
    onError: (error) => {
      console.error("Error creating base:", error);
    },
  });

  const handleCreateBase = () => {
    createBase.mutate({ name: "Untitled Base" });
  };

  return (
    <button
      className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700"
      onClick={handleCreateBase}
    >
      <Plus className="h-4 w-4" />
      {expanded && <span>Create</span>}
    </button>
  );
};

export default CreateBaseButton;
