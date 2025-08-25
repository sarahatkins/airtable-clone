import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import Dashboard from "./_components/home";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("./login"); // Replace with the actual path to your latest post page
  }

  return <Dashboard />
}
