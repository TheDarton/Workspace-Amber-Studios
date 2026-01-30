import type {
  DailyStatsData,
  ShiftData,
  WHData,
  MistakeStatsData,
  CSVFileType,
  AvailableMonth,
  ShiftRow,
  WHRow,
} from './csvTypes';
import { excelDateToJSDate, getWeekday, getMistakeCategory } from './csvTypes';

function parseCSVToArray(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const result: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current);
    result.push(row);
  }

  return result;
}

export async function loadCSVFile(
  country: string,
  fileType: CSVFileType,
  month: string
): Promise<string[][]> {
  const fileName = `${fileType}_${month}.csv`;
  const filePath = `${country}/${fileName}`;

  console.log(`[CSV Loader] Attempting to load from static files: ${filePath}`);

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load ${fileName}: ${response.statusText}`);
    }

    const text = await response.text();
    console.log(`[CSV Loader] Successfully loaded ${fileName}, size: ${text.length} bytes`);
    const parsed = parseCSVToArray(text);
    console.log(`[CSV Loader] Parsed into ${parsed.length} rows`);
    return parsed;
  } catch (error) {
    console.error(`[CSV Loader] Error loading ${filePath}:`, error);
    throw error;
  }
}

export async function checkFileExists(
  country: string,
  fileType: CSVFileType,
  month: string
): Promise<boolean> {
  const fileName = `${fileType}_${month}.csv`;
  const filePath = `${country}/${fileName}`;

  try {
    const response = await fetch(filePath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export async function detectAvailableMonths(country: string): Promise<string[]> {
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const requiredFileTypes: CSVFileType[] = ['Daily_Stats', 'Dealer_Shift', 'Dealer_Stats'];
  const detectedMonths: string[] = [];

  for (const month of allMonths) {
    let hasAllRequired = true;
    for (const fileType of requiredFileTypes) {
      const exists = await checkFileExists(country, fileType, month);
      if (!exists) {
        hasAllRequired = false;
        break;
      }
    }
    if (hasAllRequired) {
      detectedMonths.push(month);
    }
  }

  return detectedMonths;
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

  const totalHoursIdx = headers.findIndex(h => h && h.toLowerCase().includes('total'));
  const sumIdx = headers.findIndex(h => h && h.toLowerCase() === 'sum');
  const holidayIdx = headers.findIndex(h => h && h.toLowerCase().includes('holiday'));

  const dates: Record<number, number> = {};
  const weekdays: Record<number, string> = {};

  for (let i = 4; i < headers.length; i++) {
    const dayNum = parseInt(headers[i]);
    if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
      dates[dayNum] = parseInt(row1[i]) || dayNum;
      weekdays[dayNum] = row2[i] || '';
    }
  }

  const rows: WHRow[] = [];
  let currentPersonName = '';

  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    const nameSurname = row[2]?.trim() || '';
    const dayNight = row[3]?.trim() as WHRow['dayNight'];

    if (!dayNight || (dayNight !== 'Day hours' && dayNight !== 'Night hours')) continue;

    if (nameSurname) {
      currentPersonName = nameSurname;
    }

    const parsedRow: WHRow = {
      nameSurname: currentPersonName,
      dayNight: dayNight || '',
      hours: {},
      totalHours: '',
      sum: '',
      holiday: '',
    };

    for (let j = 4; j < headers.length; j++) {
      const dayNum = parseInt(headers[j]);
      if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
        parsedRow.hours[dayNum] = row[j] || '';
      }
    }

    parsedRow.totalHours = totalHoursIdx >= 0 ? (row[totalHoursIdx] || '') : '';
    parsedRow.sum = sumIdx >= 0 ? (row[sumIdx] || '') : '';
    parsedRow.holiday = holidayIdx >= 0 ? (row[holidayIdx] || '') : '';

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
    const description = row1[i] || '';

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
    nameSurname: row2[2] || '',
    nickname: row2[3] || '',
    total: row2[4] || '',
    mistakes: {} as Record<string, string>,
  };

  for (let i = 5; i < headers.length; i++) {
    const code = headers[i];
    if (code) {
      totalRow.mistakes[code] = row2[i] || '';
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
