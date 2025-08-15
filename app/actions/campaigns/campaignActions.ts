import { databases } from '@/lib/appwrite';
import { Campaign } from '@/types/schema';
import { ID, Query } from 'appwrite';
import { cookies } from 'next/headers';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID as string;
const CAMPAIGNS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_CAMPAIGNS_COLLECTION_ID as string;

export interface CreateCampaignData {
    project_id: string;
    name: string;
    description?: string;
    message: string;
    contact_targets: string[];
    group_targets: string[];
    type: 'sms' | 'whatsapp' | 'email';
    scheduled_at?: string;
}

export const createCampaign = async (campaignData: CreateCampaignData): Promise<Campaign | null> => {
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
            DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            ID.unique(),
            {
                ...campaignData,
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

export const getCampaigns = async (projectId?: string): Promise<Campaign[]> => {
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            return [];
        }

        const { account, client } = await import('@/lib/appwrite');
        client.setSession(session.value);
        const user = await account.get();

        const queries = [
            Query.equal('user_id', user.$id),
            Query.orderDesc('$createdAt')
        ];

        // Filtrer par projet si spécifié
        if (projectId) {
            queries.push(Query.equal('project_id', projectId));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            queries
        );

        return response.documents as unknown as Campaign[];
    } catch (error) {
        console.error('Erreur lors de la récupération des campagnes:', error);
        return [];
    }
};

export const getCampaignById = async (campaignId: string): Promise<Campaign | null> => {
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            return null;
        }

        const { account, client } = await import('@/lib/appwrite');
        client.setSession(session.value);
        const user = await account.get();

        const campaign = await databases.getDocument(
            DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            campaignId
        );

        // Vérifier que l'utilisateur a accès à cette campagne
        if (campaign.user_id !== user.$id) {
            throw new Error('Accès non autorisé');
        }

        return campaign as unknown as Campaign;
    } catch (error) {
        console.error('Erreur lors de la récupération de la campagne:', error);
        return null;
    }
};

export const updateCampaign = async (
    campaignId: string, 
    updateData: Partial<CreateCampaignData>
): Promise<Campaign | null> => {
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            return null;
        }

        const { account, client } = await import('@/lib/appwrite');
        client.setSession(session.value);
        const user = await account.get();

        // Vérifier d'abord que l'utilisateur possède cette campagne
        const existingCampaign = await getCampaignById(campaignId);
        if (!existingCampaign) {
            throw new Error('Campagne non trouvée');
        }

        const updatedCampaign = await databases.updateDocument(
            DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            campaignId,
            {
                ...updateData,
                updated_at: new Date().toISOString(),
            }
        );

        return updatedCampaign as unknown as Campaign;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la campagne:', error);
        return null;
    }
};

export const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            return false;
        }

        const { account, client } = await import('@/lib/appwrite');
        client.setSession(session.value);
        const user = await account.get();

        // Vérifier d'abord que l'utilisateur possède cette campagne
        const existingCampaign = await getCampaignById(campaignId);
        if (!existingCampaign) {
            throw new Error('Campagne non trouvée');
        }

        await databases.deleteDocument(
            DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            campaignId
        );

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la campagne:', error);
        return false;
    }
};
