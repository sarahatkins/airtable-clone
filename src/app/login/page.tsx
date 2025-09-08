import { redirect } from "next/navigation";
import LoginPage from "../_components/login";
import { auth } from "~/server/auth";

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    redirect("./");
  }

  return <LoginPage />;
}
