import { redirect } from "next/navigation";

import { getSessionState } from "@/lib/auth/session";

export default async function HomePage() {
  const authenticated = await getSessionState();

  redirect(authenticated ? "/scheduled" : "/login");
}
