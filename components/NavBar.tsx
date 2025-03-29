'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import checkAuth from '@/app/actions/chechAuth';

const NavBar = () => {
  interface AuthState {
    isAuthenticated: boolean;
    user: { email: string } | null;
  }
  
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  useEffect(() => {
    const checkAuthentication = async () => {
      const { isAuthenticated, user } = await checkAuth();
      setAuthState({ 
        isAuthenticated, 
        user: user ? { email: user.email } : null 
      });
    };

    checkAuthentication();
  }, []);

  const handleLogout = async () => {
    try {
      // Make a request to your logout API endpoint
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear authentication state
        setAuthState({ isAuthenticated: false, user: null });
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className="bg-slate-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          ReachDem
        </Link>
        
        <div className="flex items-center gap-4">
          {authState.isAuthenticated ? (
            <>
              <span className="mr-4">
                Connected as: {authState.user?.email}
              </span>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="default">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
