import type { WHData } from '../lib/csvTypes';
import { isWeekend } from '../lib/csvTypes';

interface WHTableProps {
  data: WHData;
  userName?: string;
}

interface GroupedRow {
  name: string;
  dayRow: WHData['rows'][0];
  nightRow: WHData['rows'][0] | null;
}

export default function WHTable({ data, userName }: WHTableProps) {
  const allGroupedRows: GroupedRow[] = [];

  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    if (row.dayNight === 'Day hours') {
      const nextRow = data.rows[i + 1];
      const nightRow = nextRow?.dayNight === 'Night hours' ? nextRow : null;
      allGroupedRows.push({
        name: row.nameSurname,
        dayRow: row,
        nightRow,
      });
      if (nightRow) i++;
    }
  }

  const filteredGroupedRows = allGroupedRows.filter(
    (group) => group.name !== '///' && group.name.trim() !== ''
  );

  const groupedRows = userName
    ? filteredGroupedRows.filter(
        (group) => group.name.toLowerCase() === userName.toLowerCase()
      )
    : filteredGroupedRows;

  const validDays = Object.keys(data.dates)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((day) => data.dates[day] > 0 && data.weekdays[day] && data.weekdays[day].trim() !== '');

  return (
    <div className="space-y-2">
      <div className="lg:hidden text-xs text-gray-500 flex items-center gap-2 px-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <span>Scroll horizontally to see all days</span>
      </div>

      {groupedRows.map((group, groupIdx) => (
        <div key={groupIdx} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-[#0891b2] text-white px-3 sm:px-4 py-2 text-sm sm:text-base font-semibold">
            {group.name}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-xs sm:text-sm font-semibold bg-blue-100 border-b border-r border-gray-300 text-gray-700 w-12">
                    D/N
                  </th>
                  <th className="px-2 py-2 text-xs sm:text-sm font-semibold bg-blue-100 border-b border-r border-gray-300 text-gray-700 w-16">
                    Total
                  </th>
                  {validDays.map((day) => {
                    const weekday = data.weekdays[day];
                    const weekend = isWeekend(weekday);
                    return (
                      <th
                        key={day}
                        className={`px-1 py-2 text-xs sm:text-sm font-semibold border-b border-r border-gray-300 ${
                          weekend ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}
                        style={{ minWidth: '40px', width: '40px' }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="font-bold">{day}</div>
                          <div className="text-[10px]">{weekday}</div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 text-xs sm:text-sm font-bold text-center bg-amber-50 border-b border-r border-gray-300 text-gray-700">
                    D
                  </td>
                  <td className="px-2 py-2 text-xs sm:text-sm font-bold text-center bg-amber-50 border-b border-r border-gray-300 text-gray-900">
                    {group.dayRow.totalHours}
                  </td>
                  {validDays.map((day) => {
                    const weekday = data.weekdays[day];
                    const weekend = isWeekend(weekday);
                    const value = group.dayRow.hours[day] || '';
                    const hasValue = value !== '' && value !== '0';
                    return (
                      <td
                        key={day}
                        className={`px-1 py-2 text-xs sm:text-sm text-center border-b border-r border-gray-300 ${
                          hasValue ? 'bg-amber-50 font-semibold text-gray-900' : weekend ? 'bg-red-50/30' : 'bg-white'
                        }`}
                        style={{ minWidth: '40px', width: '40px' }}
                      >
                        {hasValue ? value : '-'}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="px-2 py-2 text-xs sm:text-sm font-bold text-center bg-blue-100 border-r border-gray-300 text-gray-700">
                    N
                  </td>
                  <td className="px-2 py-2 text-xs sm:text-sm font-bold text-center bg-blue-100 border-r border-gray-300 text-gray-900">
                    {group.nightRow?.totalHours || '-'}
                  </td>
                  {validDays.map((day) => {
                    const weekday = data.weekdays[day];
                    const weekend = isWeekend(weekday);
                    const value = group.nightRow?.hours[day] || '';
                    const hasValue = value !== '' && value !== '0';
                    return (
                      <td
                        key={day}
                        className={`px-1 py-2 text-xs sm:text-sm text-center border-r border-gray-300 ${
                          hasValue ? 'bg-blue-50 font-semibold text-gray-900' : weekend ? 'bg-red-50/30' : 'bg-white'
                        }`}
                        style={{ minWidth: '40px', width: '40px' }}
                      >
                        {hasValue ? value : '-'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {groupedRows.length === 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm p-8 text-center">
          <p className="text-gray-500">No working hours data available</p>
        </div>
      )}
    </div>
  );
}
