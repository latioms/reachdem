'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { Query } from "appwrite";
import { Group } from "@/types/schema";

export async function getGroupsByContact(contactId: string) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot fetch contact groups",
                groups: []
            }
        }

        if (!contactId) {
            return {
                error: "Contact ID is required",
                groups: []
            }
        }

        // Vérifier que le contact appartient à l'utilisateur
        const contact = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID!,
            contactId
        );

        if (contact.user_id !== user.id) {
            return {
                error: "You don't have permission to view this contact",
                groups: []
            }
        }

        // Récupérer les relations groupe-contact
        const groupContacts = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
            [
                Query.equal('contact_id', [contactId]),
                Query.orderDesc('$createdAt')
            ]
        );

        // Récupérer les détails des groupes
        const groups: Group[] = [];
        for (const groupContact of groupContacts.documents) {
            try {
                const group = await databases.getDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID!,
                    groupContact.group_id
                );

                groups.push({
                    $id: group.$id,
                    user_id: group.user_id,
                    group_name: group.group_name,
                    description: group.description || '',
                    created_at: group.$createdAt
                });
            } catch (error) {
                // Groupe peut avoir été supprimé, on ignore l'erreur
                console.log(`Group ${groupContact.group_id} not found`);
            }
        }

        return {
            success: true,
            groups,
            total: groups.length
        }

    } catch (error) {
        console.log("Error fetching contact groups:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while fetching contact groups";
        return {
            error: errorMessage,
            groups: []
        };
    }
}
