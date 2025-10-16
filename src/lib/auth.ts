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

interface UserConfig {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  countryId: string | null;
  countryName: string | null;
}

interface UsersConfig {
  users: UserConfig[];
}

let usersCache: UsersConfig | null = null;

async function loadUsers(): Promise<UsersConfig> {
  if (usersCache) return usersCache;

  try {
    const response = await fetch('/config/users.json');
    if (!response.ok) throw new Error('Failed to load users');
    usersCache = await response.json();
    return usersCache!;
  } catch (error) {
    console.error('Error loading users:', error);
    return { users: [] };
  }
}

export async function signIn(login: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const config = await loadUsers();
    const userConfig = config.users.find(u => u.username === login);

    if (!userConfig) {
      return { user: null, error: 'Invalid login or password' };
    }

    if (userConfig.password !== password) {
      return { user: null, error: 'Invalid login or password' };
    }

    const [firstName, ...lastNameParts] = userConfig.fullName.split(' ');
    const user: User = {
      id: userConfig.id,
      country_id: userConfig.countryId,
      role: userConfig.role,
      login: userConfig.username,
      name: firstName,
      surname: lastNameParts.join(' ') || null,
      email: null,
      nickname: null,
      photo_url: null,
      must_change_password: false,
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    return { user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

export async function updatePassword(userId: string, newPassword: string): Promise<{ error: string | null }> {
  console.warn('Password update not implemented in static mode');
  return { error: 'Password update not available in static mode' };
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

    const config = await loadUsers();
    const userConfig = config.users.find(u => u.id === userId);

    if (!userConfig) {
      return { user: null, error: 'User not found' };
    }

    const [firstName, ...lastNameParts] = userConfig.fullName.split(' ');
    const user: User = {
      id: userConfig.id,
      country_id: userConfig.countryId,
      role: userConfig.role,
      login: userConfig.username,
      name: firstName,
      surname: lastNameParts.join(' ') || null,
      email: null,
      nickname: null,
      photo_url: null,
      must_change_password: false,
    };

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Failed to get user' };
  }
}

export function signOut(): void {
  localStorage.removeItem('currentUser');
}
