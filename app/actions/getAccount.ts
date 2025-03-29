import { client, account, databases } from '@/lib/appwrite';

export const getAccount = async () => {

    console.log('Client:', client);
    console.log('Databases:', databases);

    return {
        account,
        databases
    }
}