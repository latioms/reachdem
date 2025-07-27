'use server';

import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { ID, Query } from "appwrite";
import { revalidatePath } from "next/cache";

interface AddContactsToGroupParams {
    groupId: string;
    contactIds: string[];
}

export async function addContactsToGroup({
    groupId,
    contactIds
}: AddContactsToGroupParams) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot add contacts to group",
            }
        }

        if (!groupId || !contactIds || contactIds.length === 0) {
            return {
                error: "Group ID and Contact IDs are required",
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

        // Traiter chaque contact
        const results = {
            success: 0,
            failed: 0,
            duplicates: 0,
            errors: [] as string[]
        };

        for (const contactId of contactIds) {
            try {
                // Vérifier que le contact existe et appartient à l'utilisateur
                const contact = await databases.getDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID!,
                    contactId
                );
                
                if (contact.user_id !== user.id) {
                    results.failed++;
                    results.errors.push(`No permission for contact: ${contactId}`);
                    continue;
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
                    results.duplicates++;
                    continue;
                }

                // Créer la relation groupe-contact
                const relationId = ID.unique();
                await databases.createDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID!,
                    relationId,
                    {
                        group_id: groupId,
                        contact_id: contactId,
                    }
                );

                results.success++;
            } catch (error) {
                console.error(`Error processing contact ${contactId}:`, error);
                results.failed++;
                results.errors.push(`Failed to add contact: ${contactId}`);
            }
        }

        revalidatePath('/', 'layout');

        return {
            success: true,
            results,
            message: `${results.success} contacts added successfully${results.duplicates > 0 ? `, ${results.duplicates} already in group` : ''}${results.failed > 0 ? `, ${results.failed} failed` : ''}`
        }

    } catch (error) {
        console.log("Error adding contacts to group:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while adding contacts to group";
        return {
            error: errorMessage,
        };
    }
}
