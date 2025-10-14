import { supabase } from './supabase';

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
  section: SectionType
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
      return [];
    }

    return data?.map((item) => item.month) || [];
  } catch (error) {
    console.error('[Visible Months] Exception:', error);
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
