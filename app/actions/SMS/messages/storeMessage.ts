'use server'

import { databases } from "@/lib/appwrite";
import { ID } from "appwrite";

export async function storeMessage(
	userId: string,
	message: string,
	receiver: string,
	status: string
) {
	try {
		
		const message_id = ID.unique();

		await databases.createDocument(
			process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!,
			process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_MESSAGE_COLLECTION_ID!,
			message_id,
			{
				message_id,
				user_id: userId,
				content: message,
				receiver: receiver,
				status: status,
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
