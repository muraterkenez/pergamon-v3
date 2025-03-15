import React, { createContext, useContext } from 'react';
import { useAuth, useFarm } from '../lib/hooks';
import type { User } from '@supabase/supabase-js';
import type { Farm } from '../types/core';

interface AuthContextType {
  user: User | null;
  farm: Farm | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  farm: null,
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useAuth();
  const { farm, loading: farmLoading } = useFarm();

  return (
    <AuthContext.Provider value={{
      user,
      farm,
      loading: userLoading || farmLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}