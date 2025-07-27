'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { ID } from "appwrite";
import { revalidatePath } from "next/cache";

interface AddGroupParams {
    name: string;
    description?: string;
}

export async function addGroup({
    name,
    description
}: AddGroupParams) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot create group",
            }
        }

        // Validation du champ requis
        if (!name || name.trim() === '') {
            return {
                error: "Group name is required",
            }
        }

        // Créer le groupe
        const groupId = ID.unique() 
        await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID!,
            groupId,
            {
                group_name: name.trim(),
                description: description?.trim() || '',
                user_id: user.id, // Associer le groupe au propriétaire
                // Enlèvement de members_count car il n'existe pas dans le schéma Appwrite
            }
        );

        // Revalidate paths to update the UI
        revalidatePath('/groups');
        revalidatePath('/[locale]/groups');

        return {
            success: true,
            message: "Group created successfully",
            groupId
        };

    } catch (error: any) {
        console.error("Error adding group:", error);
        const errorMessage = error.response?.message || error.message || "Unknown error occurred";

        return {
            error: errorMessage,
        };
    }
}
