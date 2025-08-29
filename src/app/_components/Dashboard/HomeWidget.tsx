import { redirect } from "next/navigation";

interface HomeProps {}

const HomeWidget: React.FC<HomeProps> = () => {

  const handleWidgetClick = () => {
    redirect("./airtable?id=123")
  }

  return (
    <div className="flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white p-5 shadow-xs hover:shadow-lg" onClick={handleWidgetClick}>
      <div className="flex h-9 w-10 items-center justify-center rounded-xl bg-green-700 p-7 text-xl text-white">
        Un
      </div>
      <div className="ml-3">
        <p className="font-medium">Untitled Base</p>
        <p className="text-xs text-gray-500">Opened 15 minutes ago</p>
      </div>
    </div>
  );
};
export default HomeWidget;
