import BillingHistoryTable from "@/components/billing/BillingHistoryTable";
import CreditsManagementTable from "@/components/billing/CreditsManagementTable";
import { getDictionary } from "../../dictionaries";
import { getLang } from "@/lib/lang";

export default async function BillingPage() {
  const lang = await getLang();
  const t = await getDictionary(lang);

  return (
    <section className="mx-auto py-8 space-y-8">
        {/* <h1 className='text-2xl font-semibold'>{t.billing.title}</h1> */}
        <CreditsManagementTable dictionary={t.billing} />
        <BillingHistoryTable dictionary={t.billing} />
    </section>
  );
}
