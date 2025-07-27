'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { Query } from "appwrite";
import { revalidatePath } from "next/cache";

export async function removeContactFromGroup(groupId: string, contactId: string) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot remove contact from group",
            }
        }

        if (!groupId || !contactId) {
            return {
                error: "Group ID and Contact ID are required",
            }
        }

        // Vérifier que le groupe appartient à l'utilisateur
        const group = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID!,
            groupId
        );

        if (group.user_id !== user.id) {
            return {
                error: "You don't have permission to modify this group",
            }
        }

        // Trouver la relation groupe-contact
        const relations = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
            [
                Query.equal('group_id', [groupId]),
                Query.equal('contact_id', [contactId])
            ]
        );

        if (relations.documents.length === 0) {
            return {
                error: "Contact is not in this group",
            }
        }

        // Supprimer la relation
        await databases.deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
            relations.documents[0].$id
        );

        revalidatePath('/', 'layout');

        return {
            success: true,
            message: "Contact removed from group successfully"
        }

    } catch (error) {
        console.log("Error removing contact from group:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while removing contact from group";
        return {
            error: errorMessage,
        };
    }
}
