'use server';

import { databases } from '@/lib/appwrite';
import checkAuth from '../chechAuth';
import { Query } from 'appwrite';

const DATABASE_ID   = process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!;

export async function getTransactions(projectId?: string) {
  try {
    const { user } = await checkAuth();
    if (!user) {
      return { error: 'Utilisateur non authentifié.', transactions: [] };
    }

    const filters = [
      // Si vous voulez filtrer par user :
      Query.equal('user_id', user.id),
    ] as any[];

    if (projectId) {
      filters.push(Query.equal('project_id', projectId));
    }

    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      filters
    );

    return { success: true, transactions: res.documents };
  } catch (err: any) {
    console.error(err);
    return { error: err.response?.message || err.message || 'Erreur inconnue', transactions: [] };
  }
}
