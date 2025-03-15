import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/core';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" button to set up your project.');
}

// Create Supabase client with types and auth configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});

// Add error handling for database operations
export const handleError = (error: any) => {
  console.error('Database error:', error);
  throw new Error('An error occurred while accessing the database');
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Helper function to get current user's farm ID
export const getCurrentFarmId = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('farm_id')
      .eq('id', user.id)
      .single();

    return profile?.farm_id;
  } catch (error) {
    console.error('Error getting farm ID:', error);
    return null;
  }
};