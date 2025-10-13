import { useMemo } from 'react';
import type { ShiftData } from '../lib/csvTypes';
import { getShiftColor, isWeekend } from '../lib/csvTypes';

interface ShiftCalendarProps {
  data: ShiftData;
  userName?: string;
}

export default function ShiftCalendar({ data, userName }: ShiftCalendarProps) {
  const calendarData = useMemo(() => {
    const firstDate = Math.min(...Object.keys(data.dates).map(Number));
    const lastDate = Math.max(...Object.keys(data.dates).map(Number));

    const firstDateObj = new Date(data.year, getMonthIndex(data.month), firstDate);
    const firstDayOfWeek = firstDateObj.getDay();
    const mondayOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;

    const calendarStart = new Date(firstDateObj);
    calendarStart.setDate(firstDate + mondayOffset);

    const lastDateObj = new Date(data.year, getMonthIndex(data.month), lastDate);
    const lastDayOfWeek = lastDateObj.getDay();
    const sundayOffset = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;

    const calendarEnd = new Date(lastDateObj);
    calendarEnd.setDate(lastDate + sundayOffset);

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    const current = new Date(calendarStart);

    while (current <= calendarEnd) {
      currentWeek.push(new Date(current));

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    return { weeks, currentMonth: getMonthIndex(data.month) };
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!userName) return data.rows;
    return data.rows.filter(
      (row) => row.nameSurname.toLowerCase() === userName.toLowerCase()
    );
  }, [data.rows, userName]);

  return (
    <div className="space-y-6">
      {filteredRows.map((row, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-amber-500 text-white px-4 py-2 font-medium">
            {row.nameSurname}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-sm font-medium text-gray-700 border">Mon</th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-700 border">Tue</th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-700 border">Wed</th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-700 border">Thu</th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-700 border">Fri</th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-700 border bg-red-50">Sat</th>
                  <th className="px-3 py-2 text-sm font-medium text-gray-700 border bg-red-50">Sun</th>
                </tr>
              </thead>
              <tbody>
                {calendarData.weeks.map((week, weekIdx) => (
                  <tr key={weekIdx}>
                    {week.map((date, dayIdx) => {
                      const day = date.getDate();
                      const month = date.getMonth();
                      const isCurrentMonth = month === calendarData.currentMonth;
                      const shift = row.shifts[day] || '';
                      const backgroundColor = getShiftColor(shift);
                      const isWeekendDay = dayIdx >= 5;

                      return (
                        <td
                          key={dayIdx}
                          className={`px-3 py-6 text-center border relative ${
                            !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                          } ${isWeekendDay ? 'bg-red-50' : ''}`}
                          style={
                            backgroundColor && isCurrentMonth
                              ? { backgroundColor }
                              : undefined
                          }
                        >
                          <div className="absolute top-1 left-1 text-xs font-medium">
                            {day}
                          </div>
                          <div className="text-sm font-medium mt-2">
                            {isCurrentMonth && shift ? shift : ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Shifts:</span> {row.totalShifts}
            </div>
            <div>
              <span className="font-medium">Day Shifts:</span> {row.dayShifts}
            </div>
            <div>
              <span className="font-medium">Night Shifts:</span> {row.nightShifts}
            </div>
            <div>
              <span className="font-medium">Shift by Call:</span> {row.byCall}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getMonthIndex(monthName: string): number {
  const months = [
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
  return months.indexOf(monthName);
}
