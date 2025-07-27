'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { Query } from "appwrite";
import { Contact } from "@/types/schema";

export async function getContactsByGroup(groupId: string, limit: number = 100, offset: number = 0) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot fetch group contacts",
                contacts: []
            }
        }

        if (!groupId) {
            return {
                error: "Group ID is required",
                contacts: []
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
                contacts: []
            }
        }

        // Récupérer les relations groupe-contact
        const groupContacts = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
            [
                Query.equal('group_id', [groupId]),
                Query.orderDesc('$createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ]
        );

        // Récupérer les détails des contacts
        const contacts: Contact[] = [];
        for (const groupContact of groupContacts.documents) {
            try {
                const contact = await databases.getDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID!,
                    groupContact.contact_id
                );

                contacts.push({
                    $id: contact.$id,
                    first_name: contact.first_name || '',
                    last_name: contact.last_name || '',
                    email: contact.email,
                    phone: contact.phone || '',
                    address: contact.address || '',
                    user_id: contact.user_id,
                    created_at: contact.$createdAt
                });
            } catch (error) {
                // Contact peut avoir été supprimé, on ignore l'erreur
                console.log(`Contact ${groupContact.contact_id} not found`, error);
            }
        }

        return {
            success: true,
            contacts,
            total: groupContacts.total
        }

    } catch (error) {
        console.log("Error fetching group contacts:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while fetching group contacts";
        return {
            error: errorMessage,
            contacts: []
        };
    }
}
