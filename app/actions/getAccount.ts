import { client, account } from '@/lib/appwrite';
import { cookies } from 'next/headers';

export const getAccount = async () => {
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            return null;
        }

        // Définir la session pour la requête actuelle
        client.setSession(session.value);
        
        // Récupérer les informations de l'utilisateur
        const user = await account.get();
        
        return user;
    } catch (error) {
        console.error('Erreur lors de la récupération du compte:', error);
        return null;
    }
}