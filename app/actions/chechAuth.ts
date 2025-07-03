'use server';
import { getSession } from '@/lib/session';

async function checkAuth() {
  try {
    const session = await getSession();
    
    if (!session) {
      return {
        isAuthenticated: false,
        user: null
      };
    }

    const user = session.user;
    
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