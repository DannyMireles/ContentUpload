import { AutomationComposer } from "@/components/automation/automation-composer";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardSnapshot } from "@/lib/data/repository";

export default async function NewAutomationPage({
  searchParams
}: {
  searchParams: Promise<{
    company?: string;
  }>;
}) {
  const snapshot = await getDashboardSnapshot();
  const params = await searchParams;
  const initialCompanyId = params.company;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New automation"
        title="Build platform-specific upload plans in one pass"
        description="Upload one video, choose company, enable one or more channels, decide between AI SEO or manual copy per platform, and set exact publish times for each destination."
      />

      <AutomationComposer
        channels={snapshot.channels}
        mode="create"
        companies={snapshot.companies}
        initialCompanyId={initialCompanyId}
      />
    </div>
  );
}
