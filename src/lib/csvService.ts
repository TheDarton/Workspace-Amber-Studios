import { parseCSV } from './csvParser';
import type {
  DailyStatsData,
  ShiftData,
  WHData,
  MistakeStatsData,
  CSVFileType,
  AvailableMonth,
} from './csvTypes';
import { excelDateToJSDate, getWeekday, getMistakeCategory } from './csvTypes';

export async function loadCSVFile(
  country: string,
  fileType: CSVFileType,
  month: string
): Promise<string[][]> {
  const fileName = `${fileType}_${month}.csv`;
  const path = `/${country}/${fileName}`;

  console.log(`[CSV Loader] Attempting to load: ${path}`);

  try {
    const response = await fetch(path);
    console.log(`[CSV Loader] Response status: ${response.status} for ${path}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to load ${fileName}`);
    }
    const text = await response.text();
    console.log(`[CSV Loader] Successfully loaded ${fileName}, size: ${text.length} bytes`);
    return parseCSV(text);
  } catch (error) {
    console.error(`[CSV Loader] Error loading ${path}:`, error);
    throw error;
  }
}

export async function getAvailableMonths(country: string): Promise<AvailableMonth[]> {
  const fileTypes: CSVFileType[] = [
    'Daily_Stats',
    'Dealer_Shift',
    'Dealer_Stats',
    'Dealer_WH',
    'SM_Shift',
    'SM_WH',
  ];

  const months = ['September', 'October', 'November'];
  const available: Record<string, CSVFileType[]> = {};

  for (const month of months) {
    available[month] = [];
    for (const fileType of fileTypes) {
      try {
        await loadCSVFile(country, fileType, month);
        available[month].push(fileType);
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  return Object.entries(available)
    .filter(([, files]) => files.length > 0)
    .map(([name, files]) => ({ name, files }));
}

export function parseDailyStats(data: string[][]): DailyStatsData {
  const headers = data[0];
  const row1 = data[1];
  const row2 = data[2];

  const month = row1[2] || '';
  const year = row1[3] || '';

  const dates: Record<number, string> = {};
  const weekdays: Record<number, string> = {};

  for (let i = 5; i < headers.length; i++) {
    const dayNum = parseInt(headers[i]);
    if (!isNaN(dayNum)) {
      const excelDate = parseInt(row1[i]);
      if (!isNaN(excelDate) && excelDate > 0) {
        const jsDate = excelDateToJSDate(excelDate);
        dates[dayNum] = jsDate.toLocaleDateString();
        weekdays[dayNum] = getWeekday(jsDate);
      }
    }
  }

  const totalRow = {
    nameSurname: row2[2] || '',
    nickname: row2[3] || '',
    total: row2[4] || '',
    days: {} as Record<number, string>,
  };

  for (let i = 5; i < headers.length; i++) {
    const dayNum = parseInt(headers[i]);
    if (!isNaN(dayNum)) {
      totalRow.days[dayNum] = row2[i] || '';
    }
  }

  const rows: DailyStatsData['rows'] = [];

  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    const nameSurname = row[2]?.trim();

    if (!nameSurname || nameSurname === '0' || nameSurname === '') continue;

    const parsedRow = {
      nameSurname,
      nickname: row[3] || '',
      total: row[4] || '',
      days: {} as Record<number, string>,
    };

    for (let j = 5; j < headers.length; j++) {
      const dayNum = parseInt(headers[j]);
      if (!isNaN(dayNum)) {
        parsedRow.days[dayNum] = row[j] || '';
      }
    }

    rows.push(parsedRow);
  }

  return {
    month,
    year,
    dates,
    weekdays,
    totalRow,
    rows,
  };
}

export function parseShiftData(data: string[][]): ShiftData {
  const headers = data[0];
  const row1 = data[1];
  const row2 = data[2];

  const month = row1[2] || '';
  const year = row2[2] || '';

  const dates: Record<number, number> = {};
  const weekdays: Record<number, string> = {};

  for (let i = 3; i < headers.length - 4; i++) {
    const dayNum = parseInt(headers[i]);
    if (!isNaN(dayNum)) {
      dates[dayNum] = parseInt(row1[i]) || dayNum;
      weekdays[dayNum] = row2[i] || '';
    }
  }

  const rows: ShiftRow[] = [];

  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    const nameSurname = row[2]?.trim();

    if (!nameSurname || nameSurname === '0' || nameSurname === '') continue;

    const parsedRow: ShiftRow = {
      nameSurname,
      shifts: {},
      totalShifts: '',
      dayShifts: '',
      nightShifts: '',
      byCall: '',
    };

    for (let j = 3; j < headers.length - 4; j++) {
      const dayNum = parseInt(headers[j]);
      if (!isNaN(dayNum)) {
        parsedRow.shifts[dayNum] = row[j] || '';
      }
    }

    const summaryStartIdx = headers.length - 4;
    parsedRow.totalShifts = row[summaryStartIdx] || '';
    parsedRow.dayShifts = row[summaryStartIdx + 1] || '';
    parsedRow.nightShifts = row[summaryStartIdx + 2] || '';
    parsedRow.byCall = row[summaryStartIdx + 3] || '';

    rows.push(parsedRow);
  }

  return {
    month,
    year,
    dates,
    weekdays,
    rows,
  };
}

export function parseWHData(data: string[][]): WHData {
  const headers = data[0];
  const row1 = data[1];
  const row2 = data[2];

  const month = row1[2] || '';
  const year = row2[2] || '';

  const dates: Record<number, number> = {};
  const weekdays: Record<number, string> = {};

  for (let i = 4; i < headers.length - 3; i++) {
    const dayNum = parseInt(headers[i]);
    if (!isNaN(dayNum)) {
      dates[dayNum] = parseInt(row1[i]) || dayNum;
      weekdays[dayNum] = row2[i] || '';
    }
  }

  const rows: WHRow[] = [];

  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    const nameSurname = row[2]?.trim();

    if (!nameSurname || nameSurname === '0' || nameSurname === '') continue;

    const dayNight = row[3]?.trim() as WHRow['dayNight'];

    const parsedRow: WHRow = {
      nameSurname,
      dayNight: dayNight || '',
      hours: {},
      totalHours: '',
      holiday: '',
    };

    for (let j = 4; j < headers.length - 3; j++) {
      const dayNum = parseInt(headers[j]);
      if (!isNaN(dayNum)) {
        parsedRow.hours[dayNum] = row[j] || '';
      }
    }

    const summaryStartIdx = headers.length - 3;
    parsedRow.totalHours = row[summaryStartIdx] || '';
    parsedRow.holiday = row[summaryStartIdx + 2] || '';

    rows.push(parsedRow);
  }

  return {
    month,
    year,
    dates,
    weekdays,
    rows,
  };
}

export function parseMistakeStats(data: string[][]): MistakeStatsData {
  const headers = data[0];
  const row1 = data[1];
  const row2 = data[2];

  const month = row1[2] || '';
  const year = row1[3] || '';

  const errorCodes: Record<string, string> = {};
  const categories = {
    category1: [] as string[],
    category2: [] as string[],
    category3: [] as string[],
    category4: [] as string[],
    categoryOther: [] as string[],
  };

  for (let i = 5; i < headers.length; i++) {
    const code = headers[i];
    const description = row2[i] || '';

    if (code && code !== '') {
      errorCodes[code] = description;

      const category = getMistakeCategory(code);
      if (category === 1) categories.category1.push(code);
      else if (category === 2) categories.category2.push(code);
      else if (category === 3) categories.category3.push(code);
      else if (category === 4) categories.category4.push(code);
      else if (category === 5) categories.categoryOther.push(code);
    }
  }

  const totalRow = {
    nameSurname: row1[2] || '',
    nickname: row1[3] || '',
    total: row1[4] || '',
    mistakes: {} as Record<string, string>,
  };

  for (let i = 5; i < headers.length; i++) {
    const code = headers[i];
    if (code) {
      totalRow.mistakes[code] = row1[i] || '';
    }
  }

  const rows: MistakeStatsData['rows'] = [];

  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    const nameSurname = row[2]?.trim();

    if (!nameSurname || nameSurname === '0' || nameSurname === '') continue;

    const parsedRow = {
      nameSurname,
      nickname: row[3] || '',
      total: row[4] || '',
      mistakes: {} as Record<string, string>,
    };

    for (let j = 5; j < headers.length; j++) {
      const code = headers[j];
      if (code) {
        parsedRow.mistakes[code] = row[j] || '';
      }
    }

    rows.push(parsedRow);
  }

  return {
    month,
    year,
    errorCodes,
    categories,
    totalRow,
    rows,
  };
}
