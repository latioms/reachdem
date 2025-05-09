'use server'
import { account } from "@/lib/appwrite"
import { SessionData } from "@/types/SessionData";
import { cookies } from "next/headers";
import { signToken } from "@/lib/session";


async function createSession(email: string, password: string) {
    try {
        //generate session
        const session = await account.createEmailPasswordSession(email, password);
        console.log('Session created:', session);

        const payload: SessionData = {
            user: {
                userId: session.userId,
                email: session.providerUid,
                ip: session.ip,
                countryName: session.countryName
            }
        }
        //sign session 
        const encryptedSession = await signToken(payload);
        //set cookie
        (await cookies()).set('reachdem-session', encryptedSession, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        })

        return {
            success: true,
        };
    } catch (error) {
        console.error('Authentication Error:', error);
        return {
            success: false,
            error: error,
        };
    }
}

export default createSession;