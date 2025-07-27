'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { Query } from "appwrite";

/**
 * Récupère le nombre de contacts dans un groupe
 * @param groupId L'identifiant du groupe
 * @returns Le nombre de contacts dans le groupe
 */
export async function getContactsCountByGroup(groupId: string) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot fetch group contacts count",
                count: 0
            }
        }

        if (!groupId) {
            return {
                error: "Group ID is required",
                count: 0
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
                error: "You don't have permission to view this group",
                count: 0
            }
        }

        // Récupérer le nombre de relations groupe-contact
        const groupContacts = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
            [
                Query.equal('group_id', [groupId]),
                Query.limit(1)  // On récupère juste un document, mais le total sera correct
            ]
        );

        return {
            success: true,
            count: groupContacts.total
        }

    } catch (error) {
        console.log("Error fetching group contacts count:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while fetching group contacts count";
        return {
            error: errorMessage,
            count: 0
        };
    }
}
