'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { Query } from "appwrite";
import { Contact } from "@/types/schema";

export async function getContacts(limit: number = 5000, offset: number = 0) {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot fetch contacts",
                contacts: []
            }
        }        const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID!,            [
                Query.equal('user_id', [user.id]),
                Query.orderDesc('$createdAt'), // Ordre décroissant par date de création
                Query.limit(limit), // Limite dynamique
                Query.offset(offset) // Décalage pour la pagination
            ]
        );

        // Convert Appwrite documents to Contact type
        const contacts: Contact[] = response.documents.map(doc => ({
            $id: doc.$id,
            first_name: doc.first_name || '',
            last_name: doc.last_name || '',
            email: doc.email,
            phone: doc.phone || '',
            address: doc.address || '',
            user_id: doc.user_id,
            created_at: doc.$createdAt
        }));

        return {
            success: true,
            contacts,
            total: response.total
        }

    } catch (error: any) {
        console.log("Error fetching contacts:", error);
        const errorMessage = error.response?.message || error.message || "Unknown error occurred while fetching contacts";
        return {
            error: errorMessage,
            contacts: []
        };
    }
}