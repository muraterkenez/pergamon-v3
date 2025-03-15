import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { getCurrentUser, getCurrentFarm } from './auth';
import type { User } from '@supabase/supabase-js';
import type { Farm } from '../types/core';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial user
    getCurrentUser().then(setUser);

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export function useFarm() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentFarm()
      .then(setFarm)
      .finally(() => setLoading(false));
  }, []);

  return { farm, loading };
}

export function useSupabaseQuery<T>(
  query: () => Promise<{ data: T | null; error: any }>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    query()
      .then(({ data, error }) => {
        if (error) setError(error);
        else setData(data);
      })
      .finally(() => setLoading(false));
  }, deps);

  return { data, error, loading };
}