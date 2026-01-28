import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Optimistically set user from storage
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);

                    // Verify with backend and get fresh permissions
                    const response = await authAPI.getMe();
                    if (response.data.success) {
                        const userData = response.data.data.user;
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                } catch (error) {
                    console.error("Auth verification failed", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        // Optional: Call logout API
        authAPI.logout().catch(err => console.error(err));
    };

    const hasPermission = (permission) => {
        if (!user) return false;

        // Admin override
        const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
        if (roleName?.toLowerCase() === 'admin') return true;

        if (!user.permissions || !Array.isArray(user.permissions)) return false;

        const lowerPermission = permission.toLowerCase();
        return user.permissions.some(p =>
            (typeof p === 'string' ? p.toLowerCase() : p?.name?.toLowerCase()) === lowerPermission
        );
    };

    const hasAnyPermission = (permissions) => {
        if (!user) return false;

        // Admin override
        const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
        if (roleName?.toLowerCase() === 'admin') return true;

        if (!user.permissions || !Array.isArray(user.permissions)) return false;

        const lowerUserPerms = user.permissions.map(p =>
            (typeof p === 'string' ? p.toLowerCase() : p?.name?.toLowerCase())
        );

        return permissions.some(p => lowerUserPerms.includes(p.toLowerCase()));
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            login,
            logout,
            hasPermission,
            hasAnyPermission
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
