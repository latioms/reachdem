'use server';

import { databases } from '@/lib/appwrite';
import checkAuth from '../../chechAuth';
import { ID } from 'appwrite';
import { revalidatePath } from 'next/cache';

const DATABASE_ID       = process.env.NEXT_PUBLIC_APPWRITE_REACHDEM_DATABASE_ID!;
const COLLECTION_ID     = process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION_ID!;

export type TransactionStatus = 'success' | 'pending' | 'failed'; // ajustez à vos valeurs

export interface CreateTransactionParams {
  project_id: string;
  credits: number;
  amount: number;
  status: TransactionStatus;
}

export async function createTransaction(params: CreateTransactionParams) {
  try {
    const { user } = await checkAuth();
    if (!user) {
      return { error: 'Utilisateur non authentifié.' };
    }

    const transactionId = ID.unique()
    const now = new Date().toISOString();

    const transaction = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      transactionId,
      {
        id: transactionId,
        project_id: params.project_id,
        credits:     params.credits,
        amount:      params.amount,
        status:      params.status,
        created_at:  now,
        update_at:   now,
        user_id:     user.id,
      }
    );

    // invalide le cache de la page où vous listez les transactions
    revalidatePath('/billing');

    return { success: true, transaction };
  } catch (err: any) {
    console.error(err);
    return { error: err.response?.message || err.message || 'Erreur inconnue' };
  }
}
