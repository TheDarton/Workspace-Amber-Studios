import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          country_id: string | null;
          role: 'global_admin' | 'admin' | 'operation' | 'dealer' | 'sm';
          login: string;
          password_hash: string;
          name: string | null;
          surname: string | null;
          email: string | null;
          nickname: string | null;
          photo_url: string | null;
          must_change_password: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      countries: {
        Row: {
          id: string;
          name: string;
          prefix: string;
          active_months: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['countries']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['countries']['Insert']>;
      };
    };
  };
};
