'use server';
import { databases } from "@/lib/appwrite";
import checkAuth from "../../chechAuth";
import { ID } from "appwrite";
import { revalidatePath } from "next/cache";

export async function createProject(sender_name: string,) {

    try {
        const { user } = await checkAuth();

        if (!user) {
            return {
                error: "User not authenticated cannot create project",
            }
        }

        // create project
        const projectId = ID.unique();
        const owner = user.id;

        await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            projectId,
            {
                id: projectId,
                owner: owner,
                sender_name: sender_name,
                sms_credits: 25,
                
            }
        );

        revalidatePath('/', 'layout')

        return {
            success: true,
        }

    } catch (error) {
        console.log(error);
        const errorMessage = (error as any).response?.message || (error as Error).message || "Unknown error";
        return {
            error: errorMessage,
        };
    }

}

