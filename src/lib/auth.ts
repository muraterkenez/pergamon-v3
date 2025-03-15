import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  try {
    // 1. Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    });

    if (authError) {
      // Handle rate limit error specifically
      if (authError.message.includes('rate limit')) {
        throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç saniye bekleyip tekrar deneyin.');
      }
      throw authError;
    }
    if (!authData.user) throw new Error('Kullanıcı hesabı oluşturulamadı');

    // 2. Create farm record with default name
    const { data: farmData, error: farmError } = await supabase
      .from('farms')
      .insert([{ 
        name: 'Anadolu Süt Çiftliği',
        settings: {
          owner_id: authData.user.id,
          created_at: new Date().toISOString()
        }
      }])
      .select()
      .single();

    if (farmError) throw farmError;
    if (!farmData) throw new Error('Çiftlik kaydı oluşturulamadı');

    // 3. Create user profile with admin role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        farm_id: farmData.id,
        role: 'admin',
        settings: {
          is_owner: true,
          created_at: new Date().toISOString()
        }
      }]);

    if (profileError) throw profileError;

    return { user: authData.user, farm: farmData };
  } catch (error: any) {
    console.error('Error during signup:', error);
    throw new Error(error.message || 'Hesap oluşturulurken bir hata oluştu');
  }
}

export async function signIn(email: string, password: string) {
  try {
    // 1. Sign in with email/password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Giriş yapılamadı');

    // 2. Get user profile and farm data
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*, farm:farms(*)')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile?.farm_id) throw new Error('Kullanıcı profili bulunamadı');

    return { user: authData.user, profile };
  } catch (error: any) {
    console.error('Error during signin:', error);
    throw new Error(error.message || 'Giriş yapılırken bir hata oluştu');
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Error during signout:', error);
    throw new Error(error.message || 'Çıkış yapılırken bir hata oluştu');
  }
}

export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getCurrentFarm() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Get user profile with farm data in a single query
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('farm:farms(*)')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error getting farm:', profileError);
      return null;
    }

    return profile?.farm || null;
  } catch (error: any) {
    console.error('Error getting current farm:', error);
    return null;
  }
}