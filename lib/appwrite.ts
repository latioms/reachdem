import { Client, Account, Databases } from 'appwrite';

export const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

export const account = new Account(client);     
export const databases = new Databases(client);

export const USERS_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_DATABASE_ID as string;
export const USERS_COLLECTION_ID = 'users';
