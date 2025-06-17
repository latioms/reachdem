'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { ID } from "appwrite";
import { revalidatePath } from "next/cache";

interface AddContactParams {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    address?: string;
}

export async function addContact({
    first_name,
    last_name,
    email,
    phone,
    address
}: AddContactParams) {

    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot create contact",
            }
        }        // Validation du champ requis
        if (!email || email.trim() === '') {
            return {
                error: "Email is required",
            }
        }

        // Créer le contact
        const contactId = ID.unique();        await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID!,
            contactId,
            {
                first_name: first_name?.trim() || '',
                last_name: last_name?.trim() || '',
                email: email.trim(),
                phone: phone?.trim() || '',
                address: address?.trim() || '',
                user_id: user.id, // Associer le contact au propriétaire
            }
        );

        revalidatePath('/', 'layout');

        return {
            success: true,
            contactId: contactId,
            message: "Contact created successfully"
        }

    } catch (error: any) {
        console.log("Error creating contact:", error);
        const errorMessage = error.response?.message || error.message || "Unknown error occurred while creating contact";
        return {
            error: errorMessage,
        };
    }
}