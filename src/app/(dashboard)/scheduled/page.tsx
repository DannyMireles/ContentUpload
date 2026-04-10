import Link from "next/link";

import { ScheduledTaskBoard } from "@/components/automation/scheduled-task-board";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardSnapshot } from "@/lib/data/repository";

export default async function ScheduledPage({
  searchParams
}: {
  searchParams: Promise<{
    company?: string;
  }>;
}) {
  const snapshot = await getDashboardSnapshot();
  const params = await searchParams;
  const selectedCompanyId = params.company;
  const filteredAutomations = selectedCompanyId
    ? snapshot.automations.filter((automation) => automation.companyId === selectedCompanyId)
    : snapshot.automations;
  const selectedCompany = selectedCompanyId
    ? snapshot.companies.find((company) => company.id === selectedCompanyId)
    : null;
  const newAutomationHref = selectedCompanyId
    ? `/automations/new?company=${selectedCompanyId}`
    : "/automations/new";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Scheduled tasks"
        title={
          selectedCompany
            ? `Scheduled tasks for ${selectedCompany.name}`
            : "Everything queued, generated, and ready to ship"
        }
        description={
          selectedCompany
            ? "Showing only the automations tied to this company."
            : "This view keeps the schedule visible: video preview, AI/manual decision, generated copy, transcript status, and quick access back into edit mode."
        }
        actions={
          <Link
            href={newAutomationHref}
            className="button-primary rounded-full px-5 py-3 text-sm font-medium transition"
          >
            New automation
          </Link>
        }
      />

      <ScheduledTaskBoard automations={filteredAutomations} />
    </div>
  );
}
