import { supabase } from './supabase';

export type UserRole = 'global_admin' | 'admin' | 'operation' | 'dealer' | 'sm';

export interface User {
  id: string;
  country_id: string | null;
  role: UserRole;
  login: string;
  name: string | null;
  surname: string | null;
  email: string | null;
  nickname: string | null;
  photo_url: string | null;
  must_change_password: boolean;
}

export async function signIn(login: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    console.log('[Auth] Attempting login for:', login);

    const { data: userData, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('login', login)
      .maybeSingle();

    console.log('[Auth] Query result:', { hasData: !!userData, error: queryError });

    if (queryError) {
      console.error('[Auth] Database query error:', queryError);
      return { user: null, error: `Authentication failed: ${queryError.message}` };
    }

    if (!userData) {
      console.log('[Auth] No user found with login:', login);
      return { user: null, error: 'Invalid login or password' };
    }

    console.log('[Auth] User found, checking password');
    if (userData.password_hash !== password) {
      console.log('[Auth] Password mismatch');
      return { user: null, error: 'Invalid login or password' };
    }

    console.log('[Auth] Login successful for:', login);

    const user: User = {
      id: userData.id,
      country_id: userData.country_id,
      role: userData.role,
      login: userData.login,
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      nickname: userData.nickname,
      photo_url: userData.photo_url,
      must_change_password: userData.must_change_password,
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    return { user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

export async function updatePassword(userId: string, newPassword: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPassword, must_change_password: false })
      .eq('id', userId);

    if (error) {
      console.error('Password update error:', error);
      return { error: 'Failed to update password' };
    }

    return { error: null };
  } catch (error) {
    console.error('Password update error:', error);
    return { error: 'Failed to update password' };
  }
}

export async function getUser(userId: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      if (user.id === userId) {
        return { user, error: null };
      }
    }

    const { data: userData, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (queryError) {
      console.error('Database query error:', queryError);
      return { user: null, error: 'Failed to get user' };
    }

    if (!userData) {
      return { user: null, error: 'User not found' };
    }

    const user: User = {
      id: userData.id,
      country_id: userData.country_id,
      role: userData.role,
      login: userData.login,
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      nickname: userData.nickname,
      photo_url: userData.photo_url,
      must_change_password: userData.must_change_password,
    };

    return { user, error: null };
  } catch (error) {
    console.error('Get user error:', error);
    return { user: null, error: 'Failed to get user' };
  }
}

export function signOut(): void {
  console.log('[Auth] Signing out user');
  localStorage.removeItem('currentUser');
}

export function clearAuthData(): void {
  console.log('[Auth] Clearing all auth data');
  localStorage.clear();
}
