
import { REACHDEM_DATABASE_ID, CAMPAIGNS_COLLECTION_ID } from "@/constants/collections";
import { databases } from '@/lib/appwrite';
import { Campaign } from '@/types/schema';
import { ID, Query } from 'appwrite';
import { cookies } from 'next/headers';
import { getContactsFromGroups } from './targetsActions';

export interface CampaignData {
    project_id: string;
    name: string;
    description?: string;
    message?: string;
    contact_targets?: string[];
    group_targets?: string[];
    type: 'sms' | 'whatsapp' | 'email';
    scheduled_at?: string;
}

export const createCampaign = async (campaignData: CampaignData): Promise<Campaign | null> => {
    try {
        const session = (await cookies()).get('reachdem-session');
        if (!session) {
            throw new Error('Session not found');
        }

        // Récupérer l'utilisateur pour avoir son ID
        const { account, client } = await import('@/lib/appwrite');
        client.setSession(session.value);
        const user = await account.get();

        // Validation minimale
        if (!campaignData.project_id || !campaignData.name || !campaignData.type) {
            throw new Error('Champs requis manquants');
        }

        // Vérifier qu'il y a au moins un groupe sélectionné si des group_targets sont fournis
        if (campaignData.group_targets && campaignData.group_targets.length > 0) {
            // Récupérer et valider les contacts des groupes sélectionnés
            const validContacts = await getContactsFromGroups(campaignData.group_targets);
            
            if (validContacts.length === 0) {
                throw new Error('Aucun contact avec numéro de téléphone trouvé dans les groupes sélectionnés');
            }

            console.log(`Campagne créée avec ${validContacts.length} contacts valides`);
        }

        const campaign = await databases.createDocument(
            REACHDEM_DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            ID.unique(),
            {
                project_id: campaignData.project_id,
                name: campaignData.name,
                description: campaignData.description || '',
                message: campaignData.message || '',
                contact_targets: campaignData.contact_targets || [],
                group_targets: campaignData.group_targets || [],
                type: campaignData.type,
                scheduled_at: campaignData.scheduled_at || '',
                status: 'draft',
                user_id: user.$id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        );

        return campaign as unknown as Campaign;
    } catch (error) {
        console.error('Erreur lors de la création de la campagne:', error);
        return null;
    }
};