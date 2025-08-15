"use server";
import { databases } from '@/lib/appwrite';
import { Campaign } from '@/types/schema';
import { ID, Query } from 'appwrite';
import checkAuth from '../chechAuth';
import { getContactsFromGroups } from './targetsActions';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID as string;
const CAMPAIGNS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CAMPAIGNS_COLLECTION_ID as string;

// Validation des variables d'environnement
if (!DATABASE_ID || !CAMPAIGNS_COLLECTION_ID) {
    throw new Error('Variables d\'environnement manquantes pour les campagnes');
}

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
        const { user } = await checkAuth();
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Validation minimale
        if (!campaignData.project_id || !campaignData.name || !campaignData.type) {
            throw new Error('Champs requis manquants');
        }

        // Vérifier qu'il y a au moins un groupe sélectionné
        if (!campaignData.group_targets || campaignData.group_targets.length === 0) {
            throw new Error('Au moins un groupe doit être sélectionné');
        }

        // Récupérer et valider les contacts des groupes sélectionnés
        const validContacts = await getContactsFromGroups(campaignData.group_targets);
        
        if (validContacts.length === 0) {
            throw new Error('Aucun contact avec numéro de téléphone trouvé dans les groupes sélectionnés');
        }

        console.log(`Campagne créée avec ${validContacts.length} contacts valides`);

        const campaign = await databases.createDocument(
            DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            ID.unique(),
            {
                project_id: campaignData.project_id,
                name: campaignData.name,
                description: campaignData.description || '',
                message: campaignData.message || '',
                type: campaignData.type,
                status: 'draft',
                user_id: user.id,
                contact_targets: campaignData.contact_targets || [],
                group_targets: campaignData.group_targets || [],
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
        const { user } = await checkAuth();
        if (!user) {
            return [];
        }

        const queries = [
            Query.equal('user_id', [user.id]),
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
        const { user } = await checkAuth();
        if (!user) {
            return null;
        }

        const campaign = await databases.getDocument(
            DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            campaignId
        );

        // Vérifier que l'utilisateur a accès à cette campagne
        if (campaign.user_id !== user.id) {
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
        const { user } = await checkAuth();
        if (!user) {
            return null;
        }

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
        const { user } = await checkAuth();
        if (!user) {
            return false;
        }

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

// Mettre à jour le statut d'une campagne
export const updateCampaignStatus = async (
    campaignId: string, 
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed',
    scheduledAt?: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { user } = await checkAuth();
        if (!user) {
            return { success: false, error: 'Non authentifié' };
        }

        // Vérifier que l'utilisateur possède cette campagne
        const existingCampaign = await getCampaignById(campaignId);
        if (!existingCampaign) {
            return { success: false, error: 'Campagne non trouvée' };
        }

        const updateData: any = { status };
        
        if (scheduledAt) {
            updateData.scheduled_at = scheduledAt;
        }

        if (status === 'sent') {
            updateData.sent_at = new Date().toISOString();
        }

        await databases.updateDocument(
            DATABASE_ID,
            CAMPAIGNS_COLLECTION_ID,
            campaignId,
            updateData
        );

        return { success: true };
    } catch (error: any) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        return { 
            success: false, 
            error: error.message || "Erreur lors de la mise à jour" 
        };
    }
};

// Envoyer une campagne immédiatement
export const sendCampaignNow = async (campaignId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { user } = await checkAuth();
        if (!user) {
            return { success: false, error: 'Non authentifié' };
        }

        // Vérifier que l'utilisateur possède cette campagne
        const campaign = await getCampaignById(campaignId);
        if (!campaign) {
            return { success: false, error: 'Campagne non trouvée' };
        }

        // Vérifier que la campagne est en brouillon
        if (campaign.status !== 'draft') {
            return { success: false, error: 'Seules les campagnes en brouillon peuvent être envoyées' };
        }

        // Marquer comme en cours d'envoi
        await updateCampaignStatus(campaignId, 'sending');

        // Récupérer les contacts valides
        const validContacts = await getContactsFromGroups(campaign.group_targets || []);
        
        if (validContacts.length === 0) {
            await updateCampaignStatus(campaignId, 'failed');
            return { success: false, error: 'Aucun contact valide trouvé' };
        }

        console.log(`Début d'envoi de la campagne ${campaign.name} à ${validContacts.length} contacts`);

        // Récupérer les informations du projet pour le sender_name
        const project = await databases.getDocument(
            DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            campaign.project_id
        );

        if (!project || !project.sender_name) {
            await updateCampaignStatus(campaignId, 'failed');
            return { success: false, error: 'Projet ou nom d\'expéditeur non trouvé' };
        }

        // Importer les actions de messages
        const { recordSentMessage, sendSMSToContact } = await import('./messageActions');
        // Importer la fonction de gestion des crédits
        const { decreaseSMSCredit } = await import('../SMS/project/credit');

        let successCount = 0;
        let failureCount = 0;

        // Vérifier les crédits SMS disponibles
        if (project.sms_credits < validContacts.length) {
            await updateCampaignStatus(campaignId, 'failed');
            return { 
                success: false, 
                error: `Crédits SMS insuffisants. Requis: ${validContacts.length}, Disponibles: ${project.sms_credits}` 
            };
        }

        // Envoyer à chaque contact et enregistrer l'historique
        for (const contact of validContacts) {
            try {
                // Envoyer le SMS avec le sender_name du projet
                const smsResult = await sendSMSToContact(contact, campaign.message, project.sender_name);
                
                // Enregistrer le message dans l'historique
                const recordResult = await recordSentMessage({
                    campaign_id: campaignId,
                    contact: contact,
                    message: campaign.message,
                    status: smsResult.success ? 'sent' : 'failed',
                    error_message: smsResult.error
                });

                if (smsResult.success) {
                    successCount++;
                    // Décrémenter les crédits SMS pour chaque envoi réussi
                    await decreaseSMSCredit(campaign.project_id, 1);
                } else {
                    failureCount++;
                }

                if (!recordResult.success) {
                    console.warn(`Échec de l'enregistrement pour ${contact.phone}:`, recordResult.error);
                }
            } catch (error) {
                console.error(`Erreur lors de l'envoi à ${contact.phone}:`, error);
                failureCount++;
                
                // Enregistrer l'échec quand même
                await recordSentMessage({
                    campaign_id: campaignId,
                    contact: contact,
                    message: campaign.message,
                    status: 'failed',
                    error_message: 'Erreur système'
                });
            }
        }

        console.log(`Envoi terminé: ${successCount} succès, ${failureCount} échecs`);

        // Marquer comme envoyée (même s'il y a eu quelques échecs)
        await updateCampaignStatus(campaignId, 'sent');

        return { 
            success: true, 
            error: failureCount > 0 ? `${failureCount} messages n'ont pas pu être envoyés` : undefined
        };
    } catch (error: any) {
        console.error("Erreur lors de l'envoi:", error);
        
        // Marquer comme échouée en cas d'erreur générale
        await updateCampaignStatus(campaignId, 'failed');
        
        return { 
            success: false, 
            error: error.message || "Erreur lors de l'envoi" 
        };
    }
};

// Programmer une campagne
export const scheduleCampaign = async (
    campaignId: string, 
    scheduledAt: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { user } = await checkAuth();
        if (!user) {
            return { success: false, error: 'Non authentifié' };
        }

        // Vérifier que l'utilisateur possède cette campagne
        const campaign = await getCampaignById(campaignId);
        if (!campaign) {
            return { success: false, error: 'Campagne non trouvée' };
        }

        // Vérifier que la campagne est en brouillon
        if (campaign.status !== 'draft') {
            return { success: false, error: 'Seules les campagnes en brouillon peuvent être programmées' };
        }

        // Vérifier que la date est dans le futur
        const scheduleDate = new Date(scheduledAt);
        const now = new Date();
        
        if (scheduleDate <= now) {
            return { 
                success: false, 
                error: "La date de programmation doit être dans le futur" 
            };
        }

        // Vérifier qu'il y a des contacts valides
        const validContacts = await getContactsFromGroups(campaign.group_targets || []);
        
        if (validContacts.length === 0) {
            return { success: false, error: 'Aucun contact valide trouvé' };
        }

        await updateCampaignStatus(campaignId, 'scheduled', scheduledAt);

        // TODO: Ici vous pourriez ajouter la campagne à une queue de traitement
        // ou programmer un job pour l'envoi à la date prévue
        console.log(`Campagne ${campaign.name} programmée pour le ${scheduleDate.toLocaleString()}`);

        return { success: true };
    } catch (error: any) {
        console.error("Erreur lors de la programmation:", error);
        return { 
            success: false, 
            error: error.message || "Erreur lors de la programmation" 
        };
    }
};
