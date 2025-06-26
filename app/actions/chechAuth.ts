'use server';
import { verifyToken } from '@/lib/session';
import { cookies } from 'next/headers';

async function checkAuth() {
  const sessionCookie = (await cookies()).get('reachdem-session');

  if (!sessionCookie) {
    return {
      isAuthenticated: false,
    };
  }

  try {
    // Verify the session token and get user data
    const token = sessionCookie?.value;
    const payload = await verifyToken(token!);
    const user = payload.user;

    
    return {
      isAuthenticated: true,
      user: {
        id: user.userId,
        email: user.email,
        ip: user.ip,
        countryName: user.countryName,
      },
    };
  } catch (error) {
    console.error('Authentication check failed:', error);
    return {
      isAuthenticated: false,
      user: null
    };
  }
}

export default checkAuth;