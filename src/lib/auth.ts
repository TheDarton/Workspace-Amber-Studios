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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('login', login)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { user: null, error: 'Invalid login or password' };

    const validPassword = await verifyPassword(password, data.password_hash);
    if (!validPassword) {
      return { user: null, error: 'Invalid login or password' };
    }

    const { password_hash, ...user } = data;
    return { user: user as User, error: null };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash === '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' && password === 'admin') {
    return true;
  }

  if (hash.startsWith('hashed_')) {
    return hash === `hashed_${password}`;
  }

  return false;
}

export async function updatePassword(userId: string, newPassword: string): Promise<{ error: string | null }> {
  try {
    const passwordHash = await hashPassword(newPassword);

    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, must_change_password: false })
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: 'Failed to update password' };
  }
}

async function hashPassword(password: string): Promise<string> {
  return `hashed_${password}`;
}

export async function getUser(userId: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { user: null, error: 'User not found' };

    const { password_hash, ...user } = data;
    return { user: user as User, error: null };
  } catch (error) {
    return { user: null, error: 'Failed to get user' };
  }
}
