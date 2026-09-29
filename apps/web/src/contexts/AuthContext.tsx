import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isVerified?: boolean;
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null, user?: AuthUser | null) => void;
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children, token, setToken }: {
  children: ReactNode;
  token: string | null;
  setToken: (token: string | null, user?: AuthUser | null) => void;
}) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    if (!token) {
      setUser(null);
      localStorage.removeItem('user');
      return;
    }

    // Reuse the cached identity; only hit the API when it is missing.
    if (readStoredUser()) {
      setUser(readStoredUser());
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    api
      .get('/auth/me')
      .then((res) => {
        if (cancelled) return;
        const me = res.data.data.user as AuthUser;
        localStorage.setItem('user', JSON.stringify(me));
        setUser(me);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value: AuthContextType = {
    token,
    setToken: (next, nextUser) => {
      if (next) {
        localStorage.setItem('token', next);
        if (nextUser) {
          localStorage.setItem('user', JSON.stringify(nextUser));
          setUser(nextUser);
        }
      } else {
        logout();
        return;
      }
      setToken(next);
    },
    user,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
