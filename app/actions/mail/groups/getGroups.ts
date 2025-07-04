'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { Query } from "appwrite";
import { Group } from "@/types/schema";

export async function getGroups(limit: number = 100, offset: number = 0) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot fetch groups",
                groups: []
            }
        }

        const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID!,
            [
                Query.equal('user_id', [user.id]),
                Query.orderDesc('$createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ]
        );

        // Convert Appwrite documents to Group type compatible with our UI components
        const groups = response.documents.map(doc => ({
            // Pour le schéma interne
            $id: doc.$id,
            user_id: doc.user_id,
            group_name: doc.group_name,
            description: doc.description || '',
            created_at: doc.$createdAt,
            
            // Pour les composants UI
            id: doc.$id,
            name: doc.group_name,
            membersCount: 0, // Valeur par défaut car le champ n'existe pas dans le schéma
            createdAt: new Date(doc.$createdAt),
            updatedAt: new Date(doc.$updatedAt)
        }));

        return {
            success: true,
            groups,
            total: response.total
        }

    } catch (error) {
        console.log("Error fetching groups:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while fetching groups";
        return {
            error: errorMessage,
            groups: []
        };
    }
}
