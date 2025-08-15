"use server";
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import checkAuth from '../chechAuth';
import { Contact } from '@/types/schema';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID as string;
const MESSAGES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_MESSAGE_COLLECTION_ID as string;

export interface SentMessage {
  id: string;
  campaign_id: string;
  contact_id: string;
  contact_name: string;
  phone: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sent_at: string;
  delivered_at?: string;
  error_message?: string;
  project_id: string;
  user_id: string;
}

// Enregistrer un message envoyé en utilisant la fonction existante avec un tag campagne
export const recordSentMessage = async (messageData: {
  campaign_id: string;
  contact: Contact;
  message: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  error_message?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const { user } = await checkAuth();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Utiliser la fonction existante storeMessage
    // On ajoute l'ID de campagne au début du message pour pouvoir le retrouver plus tard
    const { storeMessage } = await import('@/app/actions/SMS/messages/storeMessage');
    
    const taggedMessage = `[CAMPAIGN:${messageData.campaign_id}] ${messageData.message}`;
    
    const result = await storeMessage(
      user.id,
      taggedMessage,
      messageData.contact.phone || 'Numéro manquant',
      messageData.status
    );

    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement du message:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de l\'enregistrement' 
    };
  }
};

// Récupérer l'historique des messages spécifiques à une campagne via le tag
export const getCampaignMessages = async (campaignId: string): Promise<SentMessage[]> => {
  try {
    const { user } = await checkAuth();
    if (!user) {
      return [];
    }

    // Utiliser la fonction existante pour récupérer tous les messages de l'utilisateur
    const { getMessagesByUserId } = await import('@/app/actions/SMS/messages/getMessagesByUserId');
    
    const result = await getMessagesByUserId(user.id);
    
    if (!result.success || !result.messages) {
      return [];
    }

    // Filtrer les messages qui contiennent le tag de la campagne
    const campaignTag = `[CAMPAIGN:${campaignId}]`;
    const campaignMessages = result.messages.filter((doc: any) => 
      doc.content && doc.content.startsWith(campaignTag)
    );

    // Adapter le format vers notre interface SentMessage
    return campaignMessages.map((doc: any) => {
      // Nettoyer le message en enlevant le tag
      const cleanMessage = doc.content.replace(campaignTag + ' ', '');
      
      return {
        id: doc.message_id || doc.$id,
        campaign_id: campaignId,
        contact_id: 'unknown',
        contact_name: 'Contact', // On ne peut pas récupérer le nom avec le schéma actuel
        phone: doc.receiver,
        message: cleanMessage,
        status: doc.status,
        sent_at: doc.$createdAt || new Date().toISOString(),
        delivered_at: undefined,
        error_message: undefined,
        project_id: 'unknown',
        user_id: doc.user_id,
      };
    }) as SentMessage[];
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de la campagne:', error);
    return [];
  }
};

// Mettre à jour le statut d'un message (pour les callbacks de livraison)
export const updateMessageStatus = async (
  messageId: string, 
  status: 'delivered' | 'failed',
  errorMessage?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { user } = await checkAuth();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    const updateData: any = { 
      status,
      ...(status === 'delivered' && { delivered_at: new Date().toISOString() }),
      ...(errorMessage && { error_message: errorMessage })
    };

    await databases.updateDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      messageId,
      updateData
    );

    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du message:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de la mise à jour' 
    };
  }
};

// Envoyer un SMS à un contact en utilisant l'API SMS existante
export const sendSMSToContact = async (
  contact: Contact, 
  message: string,
  senderName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Vérifier que le contact a un numéro de téléphone
    if (!contact.phone) {
      return { success: false, error: 'Numéro de téléphone manquant' };
    }

    // Importer la fonction SMS existante
    const { sendSMS } = await import('@/lib/sms');
    const { isMTN } = await import('@/lib/phone');
    
    // Ajuster le nom de l'expéditeur selon l'opérateur
    let finalSenderName = senderName.length > 11 ? senderName.slice(0, 11) : senderName;
    
    if (isMTN(contact.phone)) {
      finalSenderName = 'infos';
    }
    
    console.log(`Envoi SMS à ${contact.phone} depuis ${finalSenderName}: ${message}`);
    
    // Envoyer le SMS via l'API MBOA
    const response = await sendSMS(finalSenderName, message, contact.phone);
    
    if (response.success === true || response.message === "SUCCESS") {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: response.message || 'Échec de livraison SMS' 
      };
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi SMS:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors de l\'envoi' 
    };
  }
};
