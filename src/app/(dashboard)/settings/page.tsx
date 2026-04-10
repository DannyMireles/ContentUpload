import { OAuthSettingsPanel } from "@/components/settings/oauth-settings-panel";
import { getDashboardSnapshot } from "@/lib/data/repository";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{
    company?: string;
    notice?: string;
    session?: string;
  }>;
}) {
  const snapshot = await getDashboardSnapshot();
  const params = await searchParams;

  return (
    <OAuthSettingsPanel
      channels={snapshot.channels}
      companies={snapshot.companies}
      initialCompanyId={params.company}
      initialNotice={params.notice}
      initialSessionId={params.session}
    />
  );
}
