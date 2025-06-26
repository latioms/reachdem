'use server'

import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

export async function getMessagesByUserId(userId:string){
    try {
        const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_MESSAGE_COLLECTION_ID!,
            [
                Query.equal('user_id', [userId])
            ]
        );

        return {
            success: true,
            messages: response.documents
        }

    } catch (error) {
        console.log(error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error";
        return {
            error: errorMessage,
            messages: []
        };
    }
}