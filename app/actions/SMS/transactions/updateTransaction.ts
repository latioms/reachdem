'use server';

import { databases } from '@/lib/appwrite';
import checkAuth from '../../chechAuth';
import { revalidatePath } from 'next/cache';

const DATABASE_ID   = process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!;

export interface UpdateTransactionParams {
  id: string;
  credits?: number;
  amount?: number;
  status?: 'pending' | 'success' | 'failed'; // ajustez à vos valeurs
}

export async function updateTransaction(params: UpdateTransactionParams) {
  try {
    const { user } = await checkAuth();

    if (!user) {
      return { error: 'Utilisateur non authentifié.' };
    }

    const payload: Record<string, any> = {};
    if (params.credits !== undefined) payload.credits = params.credits;
    if (params.amount  !== undefined) payload.amount  = params.amount;
    if (params.status  !== undefined) payload.status  = params.status;
    payload.update_at = new Date().toISOString();

    const transaction = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      params.id,
      payload
    );

    revalidatePath('/billing'); // invalide le cache de la page où vous listez les transactions

    return { success: true, transaction };
  } catch (err: any) {
    console.error(err);
    return { error: err.response?.message || err.message || 'Erreur inconnue' };
  }
}
