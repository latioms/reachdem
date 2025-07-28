import { getLang } from "@/lib/lang";
import { getDictionary } from "../../../dictionaries";
import { Button } from "@/components/ui/button";
import { DialogCampaign } from "@/components/campaigns/dialog-campaign";
import CampaignTabs from "@/components/campaigns/campaign-tabs";

export default async function CampaignsPage() {
  const lang = await getLang();
  const t = await getDictionary(lang);

  return (
    <section className="py-10 text-center">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">{t.campaigns.title}</h1>
        <DialogCampaign dictionary={t.campaigns}>
          <Button variant="outline">{t.campaigns.sendNow}</Button>
        </DialogCampaign>

      </div>
        {/* ligne de separation */}
        <hr className="my-4" />

        <CampaignTabs />
    </section>
  );
}
