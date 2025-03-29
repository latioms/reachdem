import { createContext, useContext, useState, useEffect } from "react";
import checkAuth from '@/app/actions/chechAuth';
 
const AuthContext = createContext({
    isAuthenticated: false,
    setIsAuthenticated: (value: boolean) => {},
    currentUser: null,
    setCurrentUser: (user: any) => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<any>(null);


    useEffect(() => {
        const checkAuthentication = async () => {
            const { isAuthenticated, user } = await checkAuth();
            setIsAuthenticated(isAuthenticated);
            if (isAuthenticated) {
                setCurrentUser(user);
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