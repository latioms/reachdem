import { createContext, useContext, useState, useEffect } from "react";
import checkAuth from '@/app/actions/chechAuth';

interface User {
    id: string;
    name: string;
    email: string;
    ip: string;
    countryName: string;
} 
 
const AuthContext = createContext({
    isAuthenticated: false,
    setIsAuthenticated: (value: boolean) => {},
    currentUser: undefined as User | undefined,
    setCurrentUser: (user: User) => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User>();


    useEffect(() => {
        const checkAuthentication = async () => {
            const { isAuthenticated, user } = await checkAuth();
            setIsAuthenticated(isAuthenticated);
            if (isAuthenticated && user) {
                setCurrentUser(user as User);
            }
        };

        checkAuthentication();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser }}>
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