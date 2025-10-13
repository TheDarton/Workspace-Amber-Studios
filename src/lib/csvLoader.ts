export type CSVFileType =
  | 'Daily_Stats'
  | 'Dealer_Shift'
  | 'Dealer_Stats'
  | 'Dealer_WH'
  | 'SM_Shift'
  | 'SM_WH';

export interface CSVFileInfo {
  type: CSVFileType;
  month: string;
  countryName: string;
}

export async function loadCSVFile(
  countryName: string,
  fileType: CSVFileType,
  month: string
): Promise<string | null> {
  try {
    const fileName = `${fileType}_${month}.csv`;
    const filePath = `/public/${countryName}/${fileName}`;

    const response = await fetch(filePath);
    if (!response.ok) {
      console.warn(`CSV file not found: ${filePath}`);
      return null;
    }

    const text = await response.text();
    return text;
  } catch (error) {
    console.error(`Error loading CSV file:`, error);
    return null;
  }
}

export function getAvailableFilesForRole(role: string): CSVFileType[] {
  switch (role) {
    case 'dealer':
      return ['Daily_Stats', 'Dealer_Shift', 'Dealer_Stats', 'Dealer_WH'];
    case 'sm':
      return ['Daily_Stats', 'Dealer_Stats', 'SM_Shift', 'SM_WH'];
    case 'operation':
    case 'admin':
    case 'global_admin':
      return ['Daily_Stats', 'Dealer_Shift', 'Dealer_Stats', 'Dealer_WH', 'SM_Shift', 'SM_WH'];
    default:
      return [];
  }
}
