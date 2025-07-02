'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { revalidatePath } from "next/cache";

interface UpdateGroupParams {
    groupId: string;
    group_name?: string;
    description?: string;
}

export async function updateGroup({
    groupId,
    group_name,
    description
}: UpdateGroupParams) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot update group",
            }
        }

        if (!groupId) {
            return {
                error: "Group ID is required",
            }
        }

        // Vérifier que le groupe appartient à l'utilisateur
        const existingGroup = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID!,
            groupId
        );

        if (existingGroup.user_id !== user.id) {
            return {
                error: "You don't have permission to update this group",
            }
        }

        // Préparer les données de mise à jour
        const updateData: any = {};
        if (group_name !== undefined) {
            if (!group_name.trim()) {
                return {
                    error: "Group name cannot be empty",
                }
            }
            updateData.group_name = group_name.trim();
        }
        if (description !== undefined) {
            updateData.description = description.trim();
        }

        // Mettre à jour le groupe
        const updatedGroup = await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID!,
            groupId,
            updateData
        );

        revalidatePath('/', 'layout');

        return {
            success: true,
            group: {
                $id: updatedGroup.$id,
                user_id: updatedGroup.user_id,
                group_name: updatedGroup.group_name,
                description: updatedGroup.description,
                created_at: updatedGroup.$createdAt
            },
            message: "Group updated successfully"
        }

    } catch (error) {
        console.log("Error updating group:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while updating group";
        return {
            error: errorMessage,
        };
    }
}
