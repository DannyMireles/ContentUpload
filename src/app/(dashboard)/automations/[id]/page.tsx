import { notFound } from "next/navigation";

import { AutomationComposer } from "@/components/automation/automation-composer";
import { PageHeader } from "@/components/ui/page-header";
import { getAutomationById, getDashboardSnapshot } from "@/lib/data/repository";

export default async function EditAutomationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [snapshot, automation] = await Promise.all([
    getDashboardSnapshot(),
    getAutomationById(id)
  ]);

  if (!automation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Edit automation"
        title={`Adjust ${automation.videoName}`}
        description="This uses the same surface as creation mode so scheduling, AI/manual copy decisions, and per-channel posting windows stay consistent when you update an existing job."
      />

      <AutomationComposer
        channels={snapshot.channels}
        mode="edit"
        companies={snapshot.companies}
        initialAutomation={automation}
      />
    </div>
  );
}
