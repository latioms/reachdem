import CampaignCreateForm from './campaign-create-form';
import { getCampaigns } from '@/app/actions/campaigns/campaignActions';
import { Campaign } from '@/types/schema';

interface Props { projectId?: string; }

export default async function CampaignLists({ projectId }: Props) {
  const campaigns: Campaign[] = await getCampaigns(projectId);
  return (
    <div className="space-y-8">
      <CampaignCreateForm />
      <div className="grid gap-4">
        {campaigns.length === 0 && <p className="text-sm text-muted-foreground">Aucune campagne pour l'instant.</p>}
        {campaigns.map(c => (
          <div key={c.$id} className="border rounded p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{c.name}</h3>
              <span className="text-xs px-2 py-1 rounded bg-secondary">{c.status}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{c.message}</p>
            <div className="text-xs text-muted-foreground flex gap-4">
              <span>Contacts: {c.contact_targets?.length || 0}</span>
              <span>Groupes: {c.group_targets?.length || 0}</span>
              {c.scheduled_at && <span>Planifiée: {new Date(c.scheduled_at).toLocaleString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
