import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import Dashboard from "./_components/home";
import { SessionProvider } from "next-auth/react";

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect("./login"); // Replace with the actual path to your latest post page
  }

  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  );
}
