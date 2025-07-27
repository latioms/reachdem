'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { ID } from "appwrite";
import { revalidatePath } from "next/cache";

interface CreateGroupParams {
    group_name: string;
    description?: string;
}

export async function createGroup({
    group_name,
    description
}: CreateGroupParams) {

    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot create group",
            }
        }

        // Validation du champ requis
        if (!group_name || group_name.trim() === '') {
            return {
                error: "Group name is required",
            }
        }

        // Créer le groupe
        const groupId = ID.unique();
        const group = await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID!,
            groupId,
            {
                user_id: user.id,
                group_name: group_name.trim(),
                description: description?.trim() || '',
            }
        );

        revalidatePath('/', 'layout');

        return {
            success: true,
            groupId: groupId,
            group: {
                $id: group.$id,
                user_id: group.user_id,
                group_name: group.group_name,
                description: group.description,
                created_at: group.$createdAt
            },
            message: "Group created successfully"
        }

    } catch (error) {
        console.log("Error creating group:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while creating group";
        return {
            error: errorMessage,
        };
    }
}
