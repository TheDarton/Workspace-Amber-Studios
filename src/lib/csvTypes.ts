export interface DailyStatsRow {
  nameSurname: string;
  nickname: string;
  total: string;
  days: Record<number, string>;
}

export interface DailyStatsData {
  month: string;
  year: string;
  dates: Record<number, string>;
  weekdays: Record<number, string>;
  totalRow: DailyStatsRow;
  rows: DailyStatsRow[];
}

export interface ShiftRow {
  nameSurname: string;
  shifts: Record<number, string>;
  totalShifts: string;
  dayShifts: string;
  nightShifts: string;
  byCall: string;
}

export interface ShiftData {
  month: string;
  year: string;
  dates: Record<number, number>;
  weekdays: Record<number, string>;
  rows: ShiftRow[];
}

export interface WHRow {
  nameSurname: string;
  dayNight: 'Day hours' | 'Night hours' | '';
  hours: Record<number, string>;
  totalHours: string;
  sum: string;
  holiday: string;
}

export interface WHData {
  month: string;
  year: string;
  dates: Record<number, number>;
  weekdays: Record<number, string>;
  rows: WHRow[];
}

export interface MistakeStatsRow {
  nameSurname: string;
  nickname: string;
  total: string;
  mistakes: Record<string, string>;
}

export interface MistakeStatsData {
  month: string;
  year: string;
  errorCodes: Record<string, string>;
  categories: {
    category1: string[];
    category2: string[];
    category3: string[];
    category4: string[];
    categoryOther: string[];
  };
  totalRow: MistakeStatsRow;
  rows: MistakeStatsRow[];
}

export type CSVFileType =
  | 'Daily_Stats'
  | 'Dealer_Shift'
  | 'Dealer_Stats'
  | 'Dealer_WH'
  | 'SM_Shift'
  | 'SM_WH';

export interface AvailableMonth {
  name: string;
  files: CSVFileType[];
}

export const SHIFT_COLORS: Record<string, string> = {
  '08H': '#F7CA43',
  '14H': '#FFAC63',
  '16H': '#B5E6A2',
  '14F': '#FFAC63',
  '20H': '#7ADCFF',
  '02H': '#215C98',
  '08H+': '#F7CA43',
  '08F': '#F2F080',
  '20F': '#0070C0',
  'R': '#D86DCD',
  '16F': '#B5E6A2',
  'V': '#8ED973',
  'AU': '#00B050',
  'X': '#FC909D',
};

export function getShiftColor(shift: string): string | null {
  if (!shift || shift === '' || shift === '-') return null;

  const trimmed = shift.trim();

  if (trimmed.startsWith('S') || trimmed.startsWith('s')) {
    return '#FFFF00';
  }

  if (trimmed.startsWith('/')) {
    return '#BFBFBF';
  }

  if (trimmed.startsWith('X') || trimmed === 'X') {
    return '#FF0000';
  }

  if (trimmed === 'V') {
    return SHIFT_COLORS['V'];
  }

  if (trimmed === 'AU') {
    return SHIFT_COLORS['AU'];
  }

  if (trimmed.endsWith('!') && !trimmed.startsWith('s') && !trimmed.startsWith('S') && !trimmed.startsWith('/') && !trimmed.startsWith('X')) {
    return '#D86DCD';
  }

  const baseShift = trimmed.replace(/[!/]/g, '');
  return SHIFT_COLORS[baseShift] || null;
}

export function excelDateToJSDate(excelDate: number): Date {
  const epoch = new Date(1899, 11, 30);
  return new Date(epoch.getTime() + excelDate * 86400000);
}

export function getWeekday(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export function isWeekend(weekday: string): boolean {
  return weekday === 'Sat' || weekday === 'Sun';
}

export function getMistakeCategory(code: string): 1 | 2 | 3 | 4 | 5 | null {
  if (!code) return null;
  const firstChar = code.charAt(0);
  if (firstChar === '1') return 1;
  if (firstChar === '2') return 2;
  if (firstChar === '3') return 3;
  if (firstChar === '4') return 4;
  if (firstChar === '5') return 5;
  return null;
}
