import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStore } from './StoreContext';

interface DMUser {
  id: string;
  name: string;
  username: string;
}

interface DMAuthContextType {
  dmUser: DMUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const DMAuthContext = createContext<DMAuthContextType | undefined>(undefined);

export function DMAuthProvider({ children }: { children: React.ReactNode }) {
  const [dmUser, setDmUser] = useState<DMUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { dmEmployees } = useStore();

  useEffect(() => {
    const saved = localStorage.getItem('dm_user');
    if (saved) {
      try {
        setDmUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('dm_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const user = dmEmployees.find(e => e.username === username && e.password === password);
    if (user) {
      const sessionUser = { id: user.id, name: user.name, username: user.username };
      setDmUser(sessionUser);
      localStorage.setItem('dm_user', JSON.stringify(sessionUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setDmUser(null);
    localStorage.removeItem('dm_user');
  };

  return (
    <DMAuthContext.Provider value={{ dmUser, isAuthenticated: !!dmUser, login, logout, loading }}>
      {children}
    </DMAuthContext.Provider>
  );
}

export function useDMAuth() {
  const ctx = useContext(DMAuthContext);
  if (!ctx) throw new Error('useDMAuth must be used within DMAuthProvider');
  return ctx;
}
