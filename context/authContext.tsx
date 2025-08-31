import { createContext, useContext, useState, useEffect } from "react";
import checkAuth from '@/app/actions/chechAuth';

interface User {
    id: string;
    email: string;
    ip: string;
    countryName: string;
} 
 
const AuthContext = createContext({
    isAuthenticated: false,
    setIsAuthenticated: (value: boolean) => {},
    currentUser: undefined as User | undefined,
    setCurrentUser: (user: User | undefined) => {},
    logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | undefined>();


    useEffect(() => {
        const checkAuthentication = async () => {
            const { isAuthenticated, user } = await checkAuth();
            setIsAuthenticated(isAuthenticated);
            if (isAuthenticated && user) {
                setCurrentUser(user as User);
            } else {
                setCurrentUser(undefined);
            }
        };

        checkAuthentication();
    }, []);

    const logout = async () => {
        setIsAuthenticated(false);
        setCurrentUser(undefined);
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };