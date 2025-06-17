'use server';
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";


export async function getProjectsByUserId(userId: string) {
    try {
        const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            [
                Query.equal('owner', [userId])
            ]
        );

        return {
            success: true,
            projects: response.documents
        }

    } catch (error: any) {
        console.log(error);
        const errorMessage = error.response?.message || error.message || "Unknown error";
        return {
            error: errorMessage,
            projects: []
        };
    }
}