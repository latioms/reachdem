import { databases } from '@/lib/appwrite';
import { Stats } from '@/types/schema';
import { ID, Query } from 'appwrite';
import { cookies } from 'next/headers';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID as string;
const CAMPAIGN_STATS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_CAMPAIGN_STATS_COLLECTION_ID as string;

export interface CreateStatsData {
    campaign_id: string;
    total_contacts: number;
    sent_count?: number;
    delivered_count?: number;
    failed_count?: number;
    opened_count?: number;
    clicked_count?: number;
    unsubscribed_count?: number;
}

export const createCampaignStats = async (statsData: CreateStatsData): Promise<Stats | null> => {
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            throw new Error('Session not found');
        }

        const { client } = await import('@/lib/appwrite');
        client.setSession(session.value);

        const stats = await databases.createDocument(
            DATABASE_ID,
            CAMPAIGN_STATS_COLLECTION_ID,
            ID.unique(),
            {
                ...statsData,
                sent_count: statsData.sent_count || 0,
                delivered_count: statsData.delivered_count || 0,
                failed_count: statsData.failed_count || 0,
                clicked_count: statsData.clicked_count || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        );

        return stats as unknown as Stats;
    } catch (error) {
        console.error('Erreur lors de la création des stats:', error);
        return null;
    }
};

export const getCampaignStats = async (campaignId: string): Promise<Stats | null> => {
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            return null;
        }

        const { client } = await import('@/lib/appwrite');
        client.setSession(session.value);

        const response = await databases.listDocuments(
            DATABASE_ID,
            CAMPAIGN_STATS_COLLECTION_ID,
            [Query.equal('campaign_id', campaignId)]
        );

        if (response.documents.length === 0) {
            return null;
        }

        return response.documents[0] as unknown as Stats;
    } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
        return null;
    }
};

export const updateCampaignStats = async (
    campaignId: string,
    updateData: Partial<CreateStatsData>
): Promise<Stats | null> => {
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            return null;
        }

        const { client } = await import('@/lib/appwrite');
        client.setSession(session.value);

        // Récupérer les stats existantes
        const existingStats = await getCampaignStats(campaignId);
        if (!existingStats) {
            // Si pas de stats, les créer avec les données fournies
            return await createCampaignStats({
                campaign_id: campaignId,
                total_contacts: updateData.total_contacts || 0,
                ...updateData
            });
        }

        const updatedStats = await databases.updateDocument(
            DATABASE_ID,
            CAMPAIGN_STATS_COLLECTION_ID,
            existingStats.$id,
            {
                ...updateData,
                updated_at: new Date().toISOString(),
            }
        );

        return updatedStats as unknown as Stats;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des stats:', error);
        return null;
    }
};

export const incrementCampaignStat = async (
    campaignId: string,
    statField: 'sent_count' | 'delivered_count' | 'failed_count' | 'opened_count' | 'clicked_count' | 'unsubscribed_count',
    incrementBy: number = 1
): Promise<Stats | null> => {
    try {
        const currentStats = await getCampaignStats(campaignId);
        if (!currentStats) {
            throw new Error('Stats non trouvées pour cette campagne');
        }

        const currentValue = currentStats[statField] || 0;
        const updateData = {
            [statField]: currentValue + incrementBy
        };

        return await updateCampaignStats(campaignId, updateData);
    } catch (error) {
        console.error(`Erreur lors de l'incrémentation de ${statField}:`, error);
        return null;
    }
};

export const deleteCampaignStats = async (campaignId: string): Promise<boolean> => {
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            return false;
        }

        const { client } = await import('@/lib/appwrite');
        client.setSession(session.value);

        const existingStats = await getCampaignStats(campaignId);
        if (!existingStats) {
            return true; // Pas de stats à supprimer
        }

        await databases.deleteDocument(
            DATABASE_ID,
            CAMPAIGN_STATS_COLLECTION_ID,
            existingStats.$id
        );

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression des stats:', error);
        return false;
    }
};
