import { SignJWT, jwtVerify } from 'jose';
import { SessionData } from '@/types/SessionData';
import { cookies } from 'next/headers';

const key = new TextEncoder().encode(process.env.SESSION_SECRET);


export async function signToken(payload: SessionData) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1 day from now')
      .sign(key);
}


export async function verifyToken(input: string) {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionData;
}

export async function getSession() {
    const session = (await cookies()).get('reachdem-session')?.value;
    if (!session) return null;
    return await verifyToken(session);
}