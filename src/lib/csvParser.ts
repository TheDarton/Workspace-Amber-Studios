export interface CSVRow {
  [key: string]: string;
}

export interface ParsedCSV {
  headers: string[];
  rows: CSVRow[];
}

export function parseCSV(csvText: string): ParsedCSV {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCSVLine(lines[0]);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
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
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export function excelSerialToDate(serial: number): Date {
  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + serial * 86400000);
  return date;
}

export function getDayOfWeek(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export interface ShiftColor {
  background: string;
  text?: string;
}

export function getShiftColor(value: string): ShiftColor | null {
  const v = value.trim();

  if (v === '08H') return { background: 'rgb(247, 202, 67)' };
  if (v === '14H' || v === '14F') return { background: 'rgb(255, 172, 99)' };
  if (v === '16H' || v === '16F') return { background: 'rgb(181, 230, 162)' };
  if (v === '20H') return { background: 'rgb(122, 220, 255)' };
  if (v === '02H') return { background: 'rgb(33, 92, 152)', text: '#FFFFFF' };
  if (v === '08H+') return { background: 'rgb(247, 202, 67)' };
  if (v === '08F') return { background: 'rgb(242, 240, 128)' };
  if (v === '20F') return { background: 'rgb(0, 112, 192)', text: '#FFFFFF' };
  if (v === 'R') return { background: 'rgb(216, 109, 205)' };
  if (v === 'V') return { background: 'rgb(142, 217, 115)' };
  if (v === 'AU') return { background: 'rgb(0, 176, 80)', text: '#FFFFFF' };

  if (v.startsWith('S')) return { background: 'rgb(255, 255, 0)' };
  if (v.startsWith('/')) return { background: 'rgb(191, 191, 191)' };
  if (v.startsWith('X') && v !== 'X') return { background: 'rgb(255, 0, 0)', text: '#FFFFFF' };
  if (v === 'X') return { background: 'rgb(252, 144, 157)' };

  if (v.endsWith('!') && !v.startsWith('s') && !v.startsWith('/') && !v.startsWith('x')) {
    return { background: 'rgb(216, 109, 205)' };
  }

  return null;
}

export interface DayData {
  day: number;
  date: Date;
  isWeekend: boolean;
  dayOfWeek: string;
}

export function generateMonthDays(year: number, month: number): DayData[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: DayData[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    days.push({
      day,
      date,
      isWeekend: isWeekend(date),
      dayOfWeek: getDayOfWeek(date),
    });
  }

  return days;
}

export function filterRowsByUser(rows: CSVRow[], userFullName: string): CSVRow[] {
  return rows.filter(row => {
    const nameSurname = row['Name Surname'] || '';
    return nameSurname.toLowerCase().includes(userFullName.toLowerCase());
  });
}

export interface ShiftTime {
  label: string;
  start: string;
  end: string;
  dayHours: number;
  nightHours: number;
}

export const SHIFT_TYPES: { [key: string]: ShiftTime } = {
  '08F': { label: '8:30–20:30', start: '08:30', end: '20:30', dayHours: 12, nightHours: 0 },
  '08H': { label: '8:30–14:30', start: '08:30', end: '14:30', dayHours: 6, nightHours: 0 },
  '08H+': { label: '8:30–16:00', start: '08:30', end: '16:00', dayHours: 7.5, nightHours: 0 },
  '16H': { label: '16:00–20:30', start: '16:00', end: '20:30', dayHours: 4.5, nightHours: 0 },
  '16F': { label: '16:00–02:30', start: '16:00', end: '02:30', dayHours: 6, nightHours: 4.5 },
  '14H': { label: '14:30–20:30', start: '14:30', end: '20:30', dayHours: 6, nightHours: 0 },
  '14F': { label: '14:30–02:30', start: '14:30', end: '02:30', dayHours: 7.5, nightHours: 4.5 },
  '20F': { label: '20:30–08:30', start: '20:30', end: '08:30', dayHours: 1.5, nightHours: 10.5 },
  '20H': { label: '20:30–02:30', start: '20:30', end: '02:30', dayHours: 1.5, nightHours: 4.5 },
  '02H': { label: '02:30–08:30', start: '02:30', end: '08:30', dayHours: 3.5, nightHours: 2.5 },
  'X': { label: 'Day Off', start: '', end: '', dayHours: 0, nightHours: 0 },
  'V': { label: 'Vacation', start: '', end: '', dayHours: 0, nightHours: 0 },
  '/': { label: 'No Shift Available', start: '', end: '', dayHours: 0, nightHours: 0 },
  '-': { label: 'Not Selected', start: '', end: '', dayHours: 0, nightHours: 0 },
};
