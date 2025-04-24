"use server";
import { account, databases } from "@/lib/appwrite";
import { ID } from "appwrite";

// function to decrease the sms credits of a project
export async function decreaseSmsCredits(projectId: string, smsCredits: number) {
    try {

        // get the project document
        const project = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            projectId
        );

        // check if the project exists
        if (!project) {
            return {
                error: "Project not found",
            }
        }

        // check if the user is the owner of the project
        const user = await account.get();
        if (user.$id !== project.owner) {
            return {
                error: "You are not the owner of this project",
            }
        }

        // check if the sms credits are enough
        if (project.sms_credits < smsCredits) {
            return {
                error: "Not enough sms credits",
            }
        }

        // decrease the sms credits of the project
        await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            projectId,
            {
                sms_credits: project.sms_credits - smsCredits,
            }
        );

        return {
            success: true,
        }

    } catch (error: any) {
        console.log(error);
        const errorMessage = error.response?.message || error.message || "Unknown error";
        return {
            error: errorMessage,
        };
    }
}


export async function increaseSmsCredits(projectId: string, smsCredits: number) {
    try {

        // get the project document
        const project = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            projectId
        );

        // check if the project exists
        if (!project) {
            return {
                error: "Project not found",
            }
        }

        // check if the user is the owner of the project
        const user = await account.get();
        if (user.$id !== project.owner) {
            return {
                error: "You are not the owner of this project",
            }
        }

        // increase the sms credits of the project
        await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_PROJECT_COLLECTION_ID!,
            projectId,
            {
                sms_credits: project.sms_credits + smsCredits,
            }
        );

        return {
            success: true,
        }

    } catch (error: any) {
        console.log(error);
        const errorMessage = error.response?.message || error.message || "Unknown error";
        return {
            error: errorMessage,
        };
    }
}
