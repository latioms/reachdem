'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { ID, Query } from "appwrite";
import { revalidatePath } from "next/cache";

interface AddContactToGroupParams {
    groupId: string;
    contactId: string;
}

export async function addContactToGroup({
    groupId,
    contactId
}: AddContactToGroupParams) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot add contact to group",
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

        // Vérifier que le contact appartient à l'utilisateur
        const contact = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID!,
            contactId
        );

        if (contact.user_id !== user.id) {
            return {
                error: "You don't have permission to use this contact",
            }
        }

        // Vérifier si la relation existe déjà
        const existingRelation = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
            [
                Query.equal('group_id', [groupId]),
                Query.equal('contact_id', [contactId])
            ]
        );

        if (existingRelation.documents.length > 0) {
            return {
                error: "Contact is already in this group",
            }
        }

        // Créer la relation groupe-contact
        const relationId = ID.unique();
        const groupContact = await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
            relationId,
            {
                group_id: groupId,
                contact_id: contactId,
            }
        );

        revalidatePath('/', 'layout');

        return {
            success: true,
            groupContact: {
                $id: groupContact.$id,
                group_id: groupContact.group_id,
                contact_id: groupContact.contact_id,
                created_at: groupContact.$createdAt
            },
            message: "Contact added to group successfully"
        }

    } catch (error) {
        console.log("Error adding contact to group:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while adding contact to group";
        return {
            error: errorMessage,
        };
    }
}
