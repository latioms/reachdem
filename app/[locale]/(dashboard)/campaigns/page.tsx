import { Button } from "@/components/ui/button";
import { DialogCampaign } from "@/components/campaigns/dialog-campaign";

export default function CampaignsPage() {
  return (
    <section className="py-10 text-center">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Campagnes SMS</h1>
        <DialogCampaign>
          <Button variant="outline">Envoyer Maintenant</Button>
        </DialogCampaign>
      </div>
    </section>
  );
}
