import { supabase } from './supabase';
import { detectAvailableMonths } from './csvService';
import type { User } from './auth';

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
    console.log('[Visible Months] Fetching months for:', { countryId, section, countryName });

    const { data, error } = await supabase
      .from('visible_months')
      .select('*')
      .eq('country_id', countryId)
      .eq('section', section)
      .order('priority', { ascending: true });

    console.log('[Visible Months] Query result:', { data, error, dataLength: data?.length });

    if (error) {
      console.error('[Visible Months] Error fetching months:', error);
      if (countryName) {
        console.log('[Visible Months] Attempting fallback file detection for', countryName);
        return await detectAvailableMonths(countryName);
      }
      return [];
    }

    const months = data?.map((item) => item.month) || [];
    console.log('[Visible Months] Extracted months:', months);

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
  month: string,
  user?: User | null
): Promise<boolean> {
  try {
    if (user) {
      const hasPermission = validateUserPermission(user, countryId);
      if (!hasPermission) {
        console.error('[Visible Months] Permission denied: User does not have access to this country');
        return false;
      }
    }

    if (!month || month.trim() === '') {
      return await deleteVisibleMonth(countryId, section, priority, user);
    }

    console.log('[Visible Months] Setting month:', { countryId, section, priority, month });

    const { data: existing, error: checkError } = await supabase
      .from('visible_months')
      .select('id')
      .eq('country_id', countryId)
      .eq('section', section)
      .eq('priority', priority)
      .maybeSingle();

    console.log('[Visible Months] Check result:', { existing, checkError });

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[Visible Months] Error checking existing record:', checkError);
      return false;
    }

    let error;
    if (existing) {
      console.log('[Visible Months] Updating existing record:', existing.id);
      const result = await supabase
        .from('visible_months')
        .update({
          month,
          updated_at: new Date().toISOString(),
        })
        .eq('country_id', countryId)
        .eq('section', section)
        .eq('priority', priority);
      error = result.error;
      console.log('[Visible Months] Update result:', { error });
    } else {
      console.log('[Visible Months] Inserting new record');
      const result = await supabase
        .from('visible_months')
        .insert({
          country_id: countryId,
          section,
          priority,
          month,
          updated_at: new Date().toISOString(),
        });
      error = result.error;
      console.log('[Visible Months] Insert result:', { error });
    }

    if (error) {
      console.error('[Visible Months] Error setting month:', error);
      return false;
    }

    console.log('[Visible Months] Month set successfully');
    return true;
  } catch (error) {
    console.error('[Visible Months] Exception:', error);
    return false;
  }
}

export async function deleteVisibleMonth(
  countryId: string,
  section: SectionType,
  priority: number,
  user?: User | null
): Promise<boolean> {
  try {
    if (user) {
      const hasPermission = validateUserPermission(user, countryId);
      if (!hasPermission) {
        console.error('[Visible Months] Permission denied: User does not have access to this country');
        return false;
      }
    }

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
    console.log('[Display Count] Fetching display count for country:', countryId);

    const { data, error } = await supabase
      .from('visible_months_settings')
      .select('display_count')
      .eq('country_id', countryId)
      .maybeSingle();

    console.log('[Display Count] Query result:', { data, error });

    if (error) {
      console.error('[Display Count] Error fetching display count:', error);
      return 3;
    }

    const displayCount = data?.display_count || 3;
    console.log('[Display Count] Returning display count:', displayCount);
    return displayCount;
  } catch (error) {
    console.error('[Display Count] Exception:', error);
    return 3;
  }
}

export async function setDisplayCount(
  countryId: string,
  displayCount: 1 | 2 | 3,
  user?: User | null
): Promise<boolean> {
  try {
    if (user) {
      const hasPermission = validateUserPermission(user, countryId);
      if (!hasPermission) {
        console.error('[Display Count] Permission denied: User does not have access to this country');
        return false;
      }
    }

    console.log('[Display Count] Setting display count:', { countryId, displayCount });

    const { data: existing, error: checkError } = await supabase
      .from('visible_months_settings')
      .select('id')
      .eq('country_id', countryId)
      .maybeSingle();

    console.log('[Display Count] Check result:', { existing, checkError });

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[Display Count] Error checking existing record:', checkError);
      return false;
    }

    let error;
    if (existing) {
      console.log('[Display Count] Updating existing record:', existing.id);
      const result = await supabase
        .from('visible_months_settings')
        .update({
          display_count: displayCount,
          updated_at: new Date().toISOString(),
        })
        .eq('country_id', countryId);
      error = result.error;
      console.log('[Display Count] Update result:', { error });
    } else {
      console.log('[Display Count] Inserting new record');
      const result = await supabase
        .from('visible_months_settings')
        .insert({
          country_id: countryId,
          display_count: displayCount,
          updated_at: new Date().toISOString(),
        });
      error = result.error;
      console.log('[Display Count] Insert result:', { error });
    }

    if (error) {
      console.error('[Display Count] Error setting display count:', error);
      return false;
    }

    console.log('[Display Count] Display count set successfully');
    return true;
  } catch (error) {
    console.error('[Display Count] Exception:', error);
    return false;
  }
}

function validateUserPermission(user: User, countryId: string): boolean {
  if (user.role === 'global_admin') {
    return true;
  }

  if (user.role === 'admin' && user.country_id === countryId) {
    return true;
  }

  return false;
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
