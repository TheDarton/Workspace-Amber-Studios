import { useMemo } from 'react';
import { parseCSV, getShiftColor, isWeekend } from '../lib/csvParser';

interface CSVTableProps {
  csvData: string;
  userFullName?: string;
  filterByUser?: boolean;
  hideColumns?: string[];
}

export function CSVTable({ csvData, userFullName, filterByUser, hideColumns = [] }: CSVTableProps) {
  const { headers, rows, filteredRows } = useMemo(() => {
    const parsed = parseCSV(csvData);
    let filtered = parsed.rows;

    if (filterByUser && userFullName) {
      filtered = parsed.rows.filter(row => {
        const nameSurname = row['Name Surname'] || '';
        return nameSurname.toLowerCase().trim() === userFullName.toLowerCase().trim();
      });
    }

    const visibleHeaders = parsed.headers.filter(h => !hideColumns.includes(h));

    return {
      headers: visibleHeaders,
      rows: parsed.rows,
      filteredRows: filtered,
    };
  }, [csvData, userFullName, filterByUser, hideColumns]);

  if (!csvData || rows.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const getCellStyle = (row: Record<string, string>, header: string): React.CSSProperties => {
    const value = row[header] || '';
    const color = getShiftColor(value);

    if (color) {
      return {
        backgroundColor: color.background,
        color: color.text || '#000000',
        fontWeight: 500,
      };
    }

    const isNumeric = !isNaN(parseInt(header));
    if (isNumeric) {
      try {
        const serial = parseInt(value);
        if (serial > 40000) {
          const date = new Date(1899, 11, 30);
          date.setDate(date.getDate() + serial);
          if (isWeekend(date)) {
            return { backgroundColor: 'rgba(255, 200, 200, 0.15)' };
          }
        }
      } catch {
        // Invalid date format
      }
    }

    return {};
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left text-12 font-semibold text-gray-700 uppercase border-b border-gray-200 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-gray-50 transition-colors"
            >
              {headers.map((header, colIdx) => {
                const value = row[header] || '';
                const cellStyle = getCellStyle(row, header);

                return (
                  <td
                    key={colIdx}
                    className="px-4 py-3 text-14 border-b border-gray-200 whitespace-nowrap"
                    style={cellStyle}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
