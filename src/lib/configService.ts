import { supabase } from './supabase';

export interface Country {
  id: string;
  name: string;
  prefix: string;
}

let countriesCache: Country[] | null = null;

export async function loadCountries(): Promise<Country[]> {
  if (countriesCache) return countriesCache;

  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, prefix')
      .order('name');

    if (error) throw error;

    countriesCache = data || [];
    return countriesCache;
  } catch (error) {
    console.error('Error loading countries:', error);
    return [];
  }
}
