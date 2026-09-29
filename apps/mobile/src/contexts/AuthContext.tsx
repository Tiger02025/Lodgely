import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  user: any;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken) {
        setToken(storedToken);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    loadAuth();
  }, []);

  const setToken = async (t: string | null) => {
    setTokenState(t);
    if (t) {
      await AsyncStorage.setItem('token', t);
    } else {
      await AsyncStorage.removeItem('token');
    }
  };

  const setUser = async (u: any) => {
    setUserState(u);
    if (u) {
      await AsyncStorage.setItem('user', JSON.stringify(u));
    } else {
      await AsyncStorage.removeItem('user');
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        setToken,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
