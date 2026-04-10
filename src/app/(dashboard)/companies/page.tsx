import { CompanyGrid } from "@/components/automation/company-grid";
import { getDashboardSnapshot } from "@/lib/data/repository";

export default async function CompaniesPage() {
  const snapshot = await getDashboardSnapshot();

  return <CompanyGrid companies={snapshot.companies} channels={snapshot.channels} />;
}
