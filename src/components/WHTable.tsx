import type { WHData } from '../lib/csvTypes';
import { isWeekend } from '../lib/csvTypes';

interface WHTableProps {
  data: WHData;
  userName?: string;
}

export default function WHTable({ data, userName }: WHTableProps) {
  const filteredRows = userName
    ? data.rows.filter(
        (row) => row.nameSurname.toLowerCase() === userName.toLowerCase()
      )
    : data.rows;

  interface GroupedRow {
    name: string;
    dayRow: WHData['rows'][0];
    nightRow: WHData['rows'][0] | null;
  }

  const groupedRows: GroupedRow[] = [];

  for (let i = 0; i < filteredRows.length; i += 2) {
    const dayRow = filteredRows[i];
    const nightRow = filteredRows[i + 1];

    if (dayRow && dayRow.dayNight === 'Day hours') {
      groupedRows.push({
        name: dayRow.nameSurname,
        dayRow,
        nightRow: nightRow?.dayNight === 'Night hours' ? nightRow : null,
      });
    }
  }

  const validDays = Object.keys(data.dates)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((day) => data.dates[day] > 0);

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th
              rowSpan={3}
              className="px-4 py-2 text-left text-sm font-medium text-gray-700 border"
            >
              Name Surname
            </th>
            <th
              colSpan={2}
              className="px-4 py-2 text-center text-sm font-medium text-gray-700 border bg-amber-500 text-white"
            >
              {data.month} {data.year}
            </th>
            {validDays.map((day) => (
              <th
                key={day}
                className="px-3 py-2 text-center text-sm font-medium text-gray-700 border"
              >
                {day}
              </th>
            ))}
            <th
              rowSpan={3}
              className="px-4 py-2 text-center text-sm font-medium text-gray-700 border bg-blue-50"
            >
              Total Hours
            </th>
            <th
              rowSpan={2}
              className="px-4 py-2 text-center text-sm font-medium text-gray-700 border"
            >
              Sum
            </th>
            <th
              rowSpan={3}
              className="px-4 py-2 text-center text-sm font-medium text-gray-700 border bg-green-50"
            >
              That include Holiday hours
            </th>
          </tr>
          <tr>
            <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">
              Day/Night
            </th>
            <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border"></th>
            {validDays.map((day) => (
              <th
                key={day}
                className="px-2 py-1 text-center text-xs text-gray-600 border"
              >
                {data.dates[day]}
              </th>
            ))}
          </tr>
          <tr>
            <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border"></th>
            <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border"></th>
            {validDays.map((day) => {
              const weekday = data.weekdays[day];
              const weekend = isWeekend(weekday);
              return (
                <th
                  key={day}
                  className={`px-2 py-1 text-center text-xs font-medium border ${
                    weekend ? 'bg-red-100 text-red-700' : 'text-gray-600'
                  }`}
                >
                  {weekday}
                </th>
              );
            })}
            <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groupedRows.map((group, idx) => (
            <>
              <tr key={`${idx}-day`} className="hover:bg-gray-50">
                <td
                  rowSpan={2}
                  className="px-4 py-3 text-sm font-medium text-gray-900 border"
                >
                  {group.name}
                </td>
                <td className="px-3 py-2 text-sm text-gray-700 border">Day hours</td>
                <td className="px-3 py-2 text-sm text-gray-700 border"></td>
                {validDays.map((day) => (
                  <td
                    key={day}
                    className="px-3 py-2 text-center text-sm text-gray-900 border"
                  >
                    {group.dayRow.hours[day] || ''}
                  </td>
                ))}
                <td className="px-4 py-2 text-center text-sm font-medium text-gray-900 border bg-blue-50">
                  {group.dayRow.totalHours}
                </td>
                <td
                  rowSpan={2}
                  className="px-4 py-2 text-center text-sm font-medium text-gray-900 border"
                >
                  {parseFloat(group.dayRow.totalHours || '0') +
                    parseFloat(group.nightRow?.totalHours || '0')}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-900 border bg-green-50">
                  {group.dayRow.holiday}
                </td>
              </tr>
              <tr key={`${idx}-night`} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-700 border">Night hours</td>
                <td className="px-3 py-2 text-sm text-gray-700 border"></td>
                {validDays.map((day) => (
                  <td
                    key={day}
                    className="px-3 py-2 text-center text-sm text-gray-900 border"
                  >
                    {group.nightRow?.hours[day] || ''}
                  </td>
                ))}
                <td className="px-4 py-2 text-center text-sm font-medium text-gray-900 border bg-blue-50">
                  {group.nightRow?.totalHours || ''}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-900 border bg-green-50">
                  {group.nightRow?.holiday || ''}
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
