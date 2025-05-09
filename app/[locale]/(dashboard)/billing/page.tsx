import BillingHistoryTable from "@/components/billing/BillingHistoryTable";
import CreditsManagementTable from "@/components/billing/CreditsManagementTable";

export default function BillingPage() {
  return (
    <section className="mx-auto py-8 space-y-8">
        <CreditsManagementTable />
        <BillingHistoryTable />
    </section>
  );
}
