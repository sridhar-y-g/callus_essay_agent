import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getApiUrl } from '../api';

interface User {
  id: number;
  email: string;
  is_verified: boolean;
  is_admin: boolean;
  profile?: {
    full_name?: string;
    high_school?: string;
    target_universities?: string;
    bio?: string;
  };
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (t: string) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/me'), {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      if (!res.ok) throw new Error('Invalid token');
      const data = await res.json();
      setUser(data);
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount: restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      fetchUser(stored);
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  // login: save token AND fetch user immediately before resolving
  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsLoading(true);
    await fetchUser(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
