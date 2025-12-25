import { supabase } from './supabase';

export interface Country {
  id: string;
  name: string;
  prefix: string;
}

export type SectionType = 'schedule' | 'mistake_statistics' | 'daily_mistakes';

interface SectionConfig {
  months: string[];
  displayCount: number;
}

interface CountryVisibleMonths {
  schedule: SectionConfig;
  mistake_statistics: SectionConfig;
  daily_mistakes: SectionConfig;
}

interface VisibleMonthsConfig {
  [countryId: string]: CountryVisibleMonths;
}

let countriesCache: Country[] | null = null;
let visibleMonthsCache: VisibleMonthsConfig | null = null;

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

async function loadVisibleMonthsConfig(): Promise<VisibleMonthsConfig> {
  if (visibleMonthsCache) return visibleMonthsCache;

  try {
    const response = await fetch('/config/visible_months.json');
    if (!response.ok) throw new Error('Failed to load visible months config');
    const config = await response.json();
    visibleMonthsCache = config;
    return config;
  } catch (error) {
    console.error('Error loading visible months:', error);
    return {};
  }
}

function getLocalStorageKey(countryId: string, section?: SectionType): string {
  if (section) {
    return `visible_months_${countryId}_${section}`;
  }
  return `visible_months_${countryId}`;
}

export async function getAllVisibleMonthsForCountry(
  countryId: string
): Promise<Record<SectionType, string[]>> {
  try {
    const result: Record<SectionType, string[]> = {
      schedule: [],
      mistake_statistics: [],
      daily_mistakes: [],
    };

    for (const section of ['schedule', 'mistake_statistics', 'daily_mistakes'] as SectionType[]) {
      result[section] = await getVisibleMonthsForSection(countryId, section);
    }

    return result;
  } catch (error) {
    console.error('[Config Service] Error getting all visible months:', error);
    return {
      schedule: [],
      mistake_statistics: [],
      daily_mistakes: [],
    };
  }
}

export async function getVisibleMonthsForSection(
  countryId: string,
  section: SectionType
): Promise<string[]> {
  try {
    const localKey = getLocalStorageKey(countryId, section);
    const stored = localStorage.getItem(localKey);

    if (stored) {
      const data = JSON.parse(stored);
      return data.months || [];
    }

    const config = await loadVisibleMonthsConfig();
    const countryConfig = config[countryId];

    if (countryConfig && countryConfig[section]) {
      return countryConfig[section].months;
    }

    return [];
  } catch (error) {
    console.error('[Config Service] Error getting visible months:', error);
    return [];
  }
}

export async function getDisplayCount(countryId: string): Promise<number> {
  try {
    const localKey = `display_count_${countryId}`;
    const stored = localStorage.getItem(localKey);

    if (stored) {
      return parseInt(stored, 10);
    }

    const config = await loadVisibleMonthsConfig();
    const countryConfig = config[countryId];

    if (countryConfig && countryConfig.schedule) {
      return countryConfig.schedule.displayCount;
    }

    return 3;
  } catch (error) {
    console.error('[Config Service] Error getting display count:', error);
    return 3;
  }
}

export async function setVisibleMonth(
  countryId: string,
  section: SectionType,
  priority: 1 | 2 | 3,
  month: string
): Promise<boolean> {
  try {
    const localKey = getLocalStorageKey(countryId, section);
    const stored = localStorage.getItem(localKey);
    let months: string[] = [];

    if (stored) {
      const data = JSON.parse(stored);
      months = data.months || [];
    } else {
      months = await getVisibleMonthsForSection(countryId, section);
    }

    const index = priority - 1;

    if (month && month.trim() !== '') {
      months[index] = month;
    } else {
      months.splice(index, 1);
    }

    localStorage.setItem(localKey, JSON.stringify({ months }));
    return true;
  } catch (error) {
    console.error('[Config Service] Error setting visible month:', error);
    return false;
  }
}

export async function setDisplayCount(
  countryId: string,
  displayCount: 1 | 2 | 3
): Promise<boolean> {
  try {
    const localKey = `display_count_${countryId}`;
    localStorage.setItem(localKey, displayCount.toString());
    return true;
  } catch (error) {
    console.error('[Config Service] Error setting display count:', error);
    return false;
  }
}

export const AVAILABLE_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
