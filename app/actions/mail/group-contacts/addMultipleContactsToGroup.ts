'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { ID, Query } from "appwrite";
import { revalidatePath } from "next/cache";

interface AddMultipleContactsToGroupParams {
    groupId: string;
    contactIds: string[];
}

export async function addMultipleContactsToGroup({
    groupId,
    contactIds
}: AddMultipleContactsToGroupParams) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot add contacts to group",
            }
        }

        if (!groupId || !contactIds || contactIds.length === 0) {
            return {
                error: "Group ID and at least one Contact ID are required",
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

        const results = {
            added: 0,
            skipped: 0,
            errors: [] as string[]
        };

        // Traiter chaque contact
        for (const contactId of contactIds) {
            try {
                // Vérifier que le contact appartient à l'utilisateur
                const contact = await databases.getDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID!,
                    contactId
                );

                if (contact.user_id !== user.id) {
                    results.errors.push(`Contact ${contactId}: Permission denied`);
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
                    results.skipped++;
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

                results.added++;

            } catch (error) {
                results.errors.push(`Contact ${contactId}: ${(error as Error).message}`);
            }
        }

        revalidatePath('/', 'layout');

        return {
            success: true,
            results,
            message: `Added ${results.added} contacts, skipped ${results.skipped} existing relations${results.errors.length > 0 ? `, ${results.errors.length} errors` : ''}`
        }

    } catch (error) {
        console.log("Error adding multiple contacts to group:", error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error occurred while adding contacts to group";
        return {
            error: errorMessage,
        };
    }
}
