import type { InferSelectModel } from "drizzle-orm";
import { useRouter } from "next/navigation";
import type { base } from "~/server/db/schemas/tableSchema";

type Base = InferSelectModel<typeof base>;

interface BaseWidgetProps {
  base: Base;
}

const BaseWidget: React.FC<BaseWidgetProps> = ({ base }) => {
  const router = useRouter();

  const handleWidgetClick = () => {
    router.push(`/${base.id}`);
  };

  return (
    <div
      className="flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white p-5 hover:shadow"
      onClick={handleWidgetClick}
    >
      <div className="flex h-9 w-10 items-center justify-center rounded-xl bg-green-700 p-7 text-xl text-white">
        Un
      </div>
      <div className="ml-3">
        <p className="font-medium">{base.name}</p>
        <p className="text-xs text-gray-500">Opened 15 minutes ago</p>
      </div>
    </div>
  );
};
export default BaseWidget;
