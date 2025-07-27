'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { Group } from "@/types/schema";

export async function getGroupById(groupId: string) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot fetch group",
                group: null
            }
        }

        if (!groupId) {
            return {
                error: "Group ID is required",
                group: null
            }
        }

        // Récupérer le document du groupe
        const group = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID!,
            groupId
        );

        // Vérifier que le groupe appartient à l'utilisateur
        if (group.user_id !== user.id) {
            return {
                error: "You don't have permission to view this group",
                group: null
            }
        }

        return {
            success: true,
            group: {
                $id: group.$id,
                user_id: group.user_id,
                group_name: group.group_name,
                description: group.description || '',
                created_at: group.$createdAt,
                
                // Pour les composants UI
                id: group.$id,
                name: group.group_name,
                createdAt: new Date(group.$createdAt),
                updatedAt: new Date(group.$updatedAt)
            }
        }

    } catch (error) {
        console.log("Error fetching group:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while fetching group";
        return {
            error: errorMessage,
            group: null
        };
    }
}
