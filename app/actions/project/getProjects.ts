'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../chechAuth";
import { Project } from "@/types/schema";
import { Query } from "appwrite";

export async function getProjects() {
    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot fetch projects",
                projects: []
            }
        }

        const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            [
                Query.equal('owner', [user.id])
            ]
        );

        // Convert Appwrite documents to Project type
        const projects = response.documents.map(doc => ({
            id: doc.id,
            sender_name: doc.sender_name,
            account_id: doc.owner,
            sms_credits: doc.sms_credits,
        }));

        return {
            success: true,
            projects
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