import { getLang } from "@/lib/lang";
import { getDictionary } from "../../../../dictionaries";
import { getCampaignById } from "@/app/actions/campaigns/campaignActions";
import { getContactsFromGroups } from "@/app/actions/campaigns/targetsActions";
import { notFound } from "next/navigation";
import CampaignDetailClient from "@/components/campaigns/campaign-detail-client";

interface Props {
  params: {
    campaignId: string;
    locale: string;
  };
}

export default async function CampaignDetailPage({ params }: Props) {
  const lang = await getLang();
  const t = await getDictionary(lang);
  
  // Récupérer la campagne
  const campaign = await getCampaignById(params.campaignId);
  
  if (!campaign) {
    notFound();
  }

  // Récupérer les contacts valides des groupes
  const validContacts = await getContactsFromGroups(campaign.group_targets || []);

  return (
    <div className="container mx-auto py-6">
      <CampaignDetailClient 
        campaign={campaign}
        validContacts={validContacts}
        dictionary={t.campaigns}
      />
    </div>
  );
}
