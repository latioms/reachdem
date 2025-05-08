"use server";

import { databases } from "@/lib/appwrite";
import checkAuth from "../chechAuth";

export async function increaseSMSCredit(projectId: string, smsCount: number) {
    try {
        // Vérifier l'authentification
        const { user } = await checkAuth();
        
        if (!user) {
            return { 
                success: false, 
                error: "Utilisateur non authentifié" 
            };
        }

        // Get current project
        const project = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            projectId
        );

        // Vérifier que l'utilisateur est le propriétaire du projet
        if (project.owner !== user.id) {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à modifier les crédits de ce projet"
            };
        }

        // Calculate new credits
        const newCredits = (project.sms_credits || 0) + smsCount;

        // Update credits
        await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            projectId,
            {
                sms_credits: newCredits
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error increasing SMS credits:", error);
        return { success: false, error: error.message };
    }
}

export async function decreaseSMSCredit(projectId: string, smsCount: number) {
    try {
        // Vérifier l'authentification
        const { user } = await checkAuth();
        
        if (!user) {
            return { 
                success: false, 
                error: "Utilisateur non authentifié" 
            };
        }

        // Get current project
        const project = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            projectId
        );

        // Vérifier que l'utilisateur est le propriétaire du projet
        if (project.owner !== user.id) {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à modifier les crédits de ce projet"
            };
        }

        // Vérifier qu'il y a assez de crédits
        if (project.sms_credits < smsCount) {
            return {
                success: false,
                error: "Crédits SMS insuffisants"
            };
        }

        // Calculate new credits
        const newCredits = project.sms_credits - smsCount;

        // Update credits
        await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            projectId,
            {
                sms_credits: newCredits
            }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error decreasing SMS credits:", error);
        return { success: false, error: error.message };
    }
}