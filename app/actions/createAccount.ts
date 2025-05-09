'use server'
import { account } from "@/lib/appwrite";
import { ID } from "appwrite";
import createSession from "./createSession";

async function createAccount(name: string, email: string, password: string) {
    try {
        const response = await account.create(ID.unique(), email, password, name);
        
        if (!response.$id) {
            return {
                success: false,
                error: "Échec de la création du compte"
            };
        }

        const sessionResponse = await createSession(email, password);
        
        if (!sessionResponse.success) {
            return {
                success: false,
                error: "Compte créé mais impossible de se connecter"
            };
        }

        return {
            success: true,
            data: response
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Erreur lors de la création du compte"
        };
    }
}

export default createAccount;