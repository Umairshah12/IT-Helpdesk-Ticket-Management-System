import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role, User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateCurrentUser: (user: Partial<User>) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTechnician: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('helpdesk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('helpdesk_access_token');
  });
  const [loading, setLoading] = useState(true);

  // Validate session on boot
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('helpdesk_access_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data) {
          setUser(response.data.data);
          localStorage.setItem('helpdesk_user', JSON.stringify(response.data.data));
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        // Let Axios interceptor handle 401 refresh or clear
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('helpdesk_access_token', newToken);
    localStorage.setItem('helpdesk_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API call failed, clearing local state', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('helpdesk_access_token');
      localStorage.removeItem('helpdesk_user');
      window.location.href = '/login';
    }
  };

  const updateCurrentUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('helpdesk_user', JSON.stringify(updated));
  };

  const role: Role = user?.role || 'EMPLOYEE';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isTechnician = role === 'TECHNICIAN';
  const isEmployee = role === 'EMPLOYEE';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateCurrentUser,
        isSuperAdmin,
        isAdmin,
        isTechnician,
        isEmployee,
      }}
    >
      {children}
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

