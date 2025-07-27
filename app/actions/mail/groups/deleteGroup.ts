'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { Query } from "appwrite";
import { revalidatePath } from "next/cache";

export async function deleteGroup(groupId: string) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot delete group",
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
                error: "You don't have permission to delete this group",
            }
        }

        // lister toutes les relations groupe-contact
        const groupContacts = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
            [Query.equal('group_id', [groupId])]
        );

        // Supprimer chaque relation groupe-contact
        for (const groupContact of groupContacts.documents) {
            await databases.deleteDocument(
                process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
                groupContact.$id
            );
        }

        // Supprimer le groupe
        await databases.deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID!,
            groupId
        );

        revalidatePath('/', 'layout');

        return {
            success: true,
            message: "Group and its contacts deleted successfully"
        }

    } catch (error) {
        console.log("Error deleting group:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while deleting group";
        return {
            error: errorMessage,
        };
    }
}
