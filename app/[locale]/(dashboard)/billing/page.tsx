import BillingHistoryTable from "@/components/billing/BillingHistoryTable";
import CreditsManagementTable from "@/components/billing/CreditsManagementTable";

export default function BillingPage() {

  return (
    <section className="py-20 text-center">
      <CreditsManagementTable />
      <BillingHistoryTable />
    </section>
  );
}
