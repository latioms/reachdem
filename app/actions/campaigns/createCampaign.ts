
import { REACHDEM_DATABASE_ID, CAMPAIGNS_COLLECTION_ID } from "@/constants/collections";


import { databases } from '@/lib/appwrite';
import { Campaign } from '@/types/schema';
import { ID, Query } from 'appwrite';
import { cookies } from 'next/headers';

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

        const campaign = await databases.createDocument(
            REACHDEM_DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            ID.unique(),
            {
                ...campaignData,
                status: 'draft',
                user_id: user.$id,
            }
        );

        return campaign as unknown as Campaign;
    } catch (error) {
        console.error('Erreur lors de la création de la campagne:', error);
        return null;
    }
};