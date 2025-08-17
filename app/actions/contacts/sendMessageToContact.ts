'use server';

import { sendSMSAction } from '@/app/actions/SMS/send/sendSMS';
import { getProjectsByUserId } from '@/app/actions/SMS/project/getProjectsByUserId';
import { databases } from '@/lib/appwrite';

interface SendMessageToContactParams {
  contactId: string;
  projectId: string;
  message: string;
  phone: string;
}

export async function sendMessageToContact({
  contactId,
  projectId,
  message,
  phone
}: SendMessageToContactParams) {
  try {
    // Validation des entrées
    if (!contactId || !projectId || !message.trim() || !phone) {
      return {
        success: false,
        error: "Tous les champs sont obligatoires"
      };
    }

    if (message.length > 160) {
      return {
        success: false,
        error: "Le message ne peut pas dépasser 160 caractères"
      };
    }

    // Récupérer les informations du projet pour obtenir le sender_name
    const projectResponse = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
      projectId
    );

    if (!projectResponse) {
      return {
        success: false,
        error: "Projet non trouvé"
      };
    }

    // Vérifier que le projet a des crédits SMS
    if (projectResponse.sms_credits <= 0) {
      return {
        success: false,
        error: "Crédits SMS insuffisants"
      };
    }

    // Envoyer le SMS
    const smsResponse = await sendSMSAction(
      projectResponse.sender_name,
      message,
      phone
    );

    if (!smsResponse || smsResponse.error) {
      return {
        success: false,
        error: smsResponse?.error || "Erreur lors de l'envoi du SMS"
      };
    }

    // Décrémenter les crédits SMS du projet
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
        projectId,
        {
          sms_credits: projectResponse.sms_credits - 1
        }
      );
    } catch (creditError) {
      console.error('Error updating SMS credits:', creditError);
      // Ne pas faire échouer l'envoi si on ne peut pas mettre à jour les crédits
      // Le SMS a déjà été envoyé
    }

    return {
      success: true,
      message: "Message envoyé avec succès"
    };

  } catch (error) {
    console.error('Error sending message to contact:', error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite"
    };
  }
}
