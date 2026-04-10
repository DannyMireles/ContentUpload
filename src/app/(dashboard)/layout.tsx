import { AppShell } from "@/components/layout/app-shell";
import { getDashboardSnapshot } from "@/lib/data/repository";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const snapshot = await getDashboardSnapshot();

  return (
    <AppShell companies={snapshot.companies} channels={snapshot.channels}>
      {children}
    </AppShell>
  );
}
