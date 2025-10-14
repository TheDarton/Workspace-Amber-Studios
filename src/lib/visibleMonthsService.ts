import { supabase } from './supabase';
import { detectAvailableMonths } from './csvService';

export type SectionType = 'schedule' | 'mistake_statistics' | 'daily_mistakes';

export interface VisibleMonth {
  id: string;
  country_id: string;
  section: SectionType;
  priority: number;
  month: string;
  created_at: string;
  updated_at: string;
}

export async function getVisibleMonthsForSection(
  countryId: string,
  section: SectionType,
  countryName?: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('visible_months')
      .select('*')
      .eq('country_id', countryId)
      .eq('section', section)
      .order('priority', { ascending: true });

    if (error) {
      console.error('[Visible Months] Error fetching months:', error);
      if (countryName) {
        console.log('[Visible Months] Attempting fallback file detection for', countryName);
        return await detectAvailableMonths(countryName);
      }
      return [];
    }

    const months = data?.map((item) => item.month) || [];

    if (months.length === 0 && countryName) {
      console.log('[Visible Months] No configured months, attempting fallback file detection for', countryName);
      return await detectAvailableMonths(countryName);
    }

    return months;
  } catch (error) {
    console.error('[Visible Months] Exception:', error);
    if (countryName) {
      console.log('[Visible Months] Exception caught, attempting fallback file detection for', countryName);
      return await detectAvailableMonths(countryName);
    }
    return [];
  }
}

export async function getAllVisibleMonthsForCountry(
  countryId: string
): Promise<Record<SectionType, string[]>> {
  try {
    const { data, error } = await supabase
      .from('visible_months')
      .select('*')
      .eq('country_id', countryId)
      .order('priority', { ascending: true });

    if (error) {
      console.error('[Visible Months] Error fetching all months:', error);
      return {
        schedule: [],
        mistake_statistics: [],
        daily_mistakes: [],
      };
    }

    const result: Record<SectionType, string[]> = {
      schedule: [],
      mistake_statistics: [],
      daily_mistakes: [],
    };

    data?.forEach((item) => {
      result[item.section as SectionType].push(item.month);
    });

    return result;
  } catch (error) {
    console.error('[Visible Months] Exception:', error);
    return {
      schedule: [],
      mistake_statistics: [],
      daily_mistakes: [],
    };
  }
}

export async function setVisibleMonth(
  countryId: string,
  section: SectionType,
  priority: 1 | 2 | 3,
  month: string
): Promise<boolean> {
  try {
    if (!month || month.trim() === '') {
      return await deleteVisibleMonth(countryId, section, priority);
    }

    const { error } = await supabase
      .from('visible_months')
      .upsert(
        {
          country_id: countryId,
          section,
          priority,
          month,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'country_id,section,priority',
        }
      );

    if (error) {
      console.error('[Visible Months] Error setting month:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Visible Months] Exception:', error);
    return false;
  }
}

export async function deleteVisibleMonth(
  countryId: string,
  section: SectionType,
  priority: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('visible_months')
      .delete()
      .eq('country_id', countryId)
      .eq('section', section)
      .eq('priority', priority);

    if (error) {
      console.error('[Visible Months] Error deleting month:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Visible Months] Exception:', error);
    return false;
  }
}

export async function getDisplayCount(countryId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('visible_months_settings')
      .select('display_count')
      .eq('country_id', countryId)
      .maybeSingle();

    if (error) {
      console.error('[Display Count] Error fetching display count:', error);
      return 3;
    }

    return data?.display_count || 3;
  } catch (error) {
    console.error('[Display Count] Exception:', error);
    return 3;
  }
}

export async function setDisplayCount(
  countryId: string,
  displayCount: 1 | 2 | 3
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('visible_months_settings')
      .upsert(
        {
          country_id: countryId,
          display_count: displayCount,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'country_id',
        }
      );

    if (error) {
      console.error('[Display Count] Error setting display count:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Display Count] Exception:', error);
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
