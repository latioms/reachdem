"use server";
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Contact, Group } from '@/types/schema';
import checkAuth from '../chechAuth';

const MAILING_DB = process.env.NEXT_PUBLIC_APPWRITE_MAILING_DATABASE_ID as string;
const CONTACTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_CONTACTS_COLLECTION_ID as string;
const GROUPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUPS_COLLECTION_ID as string;
const GROUP_CONTACTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MAILING_GROUP_CONTACTS_COLLECTION_ID as string;

export const listContacts = async (): Promise<Contact[]> => {
  try {
    const { user } = await checkAuth();
    console.log('listContacts - checkAuth result:', { user });
    if (!user) {
      console.log('listContacts - No user found');
      return [];
    }
    
    console.log('listContacts - Querying with user.id:', user.id);
    const res = await databases.listDocuments(MAILING_DB, CONTACTS_COLLECTION_ID, [
      Query.equal('user_id', [user.id]),
      Query.limit(1000)
    ]);
    console.log('listContacts - Database response:', res.documents.length, 'contacts found');
    return res.documents as unknown as Contact[];
  } catch (e) {
    console.error('listContacts error', e);
    return [];
  }
};

export const listGroups = async (): Promise<Group[]> => {
  try {
    const { user } = await checkAuth();
    console.log('listGroups - checkAuth result:', { user });
    if (!user) {
      console.log('listGroups - No user found');
      return [];
    }
    
    console.log('listGroups - Querying with user.id:', user.id);
    const res = await databases.listDocuments(MAILING_DB, GROUPS_COLLECTION_ID, [
      Query.equal('user_id', [user.id]),
      Query.limit(500)
    ]);
    console.log('listGroups - Database response:', res.documents.length, 'groups found');
    return res.documents as unknown as Group[];
  } catch (e) {
    console.error('listGroups error', e);
    return [];
  }
};

export const getContactsFromGroups = async (groupIds: string[]): Promise<Contact[]> => {
  try {
    const { user } = await checkAuth();
    if (!user) {
      return [];
    }

    if (groupIds.length === 0) {
      return [];
    }

    // Récupérer les relations groupe-contact
    const groupContactsResponse = await databases.listDocuments(
      MAILING_DB, 
      GROUP_CONTACTS_COLLECTION_ID, 
      [
        Query.equal('group_id', groupIds),
        Query.limit(5000)
      ]
    );

    // Extraire les IDs de contacts uniques
    const contactIds = [...new Set(groupContactsResponse.documents.map(gc => gc.contact_id))];

    if (contactIds.length === 0) {
      return [];
    }

    // Récupérer les contacts complets
    const contactsResponse = await databases.listDocuments(
      MAILING_DB,
      CONTACTS_COLLECTION_ID,
      [
        Query.equal('$id', contactIds),
        Query.limit(5000)
      ]
    );

    const contacts = contactsResponse.documents as unknown as Contact[];

    // Filtrer les contacts qui ont un numéro de téléphone valide
    const validContacts = contacts.filter(contact => {
      return contact.phone && contact.phone.trim().length > 0;
    });

    console.log(`Contacts récupérés: ${contacts.length}, Contacts avec téléphone: ${validContacts.length}`);
    
    return validContacts;
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts des groupes:', error);
    return [];
  }
};