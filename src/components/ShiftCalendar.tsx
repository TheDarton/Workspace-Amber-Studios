import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ShiftData } from '../lib/csvTypes';
import { getShiftColor } from '../lib/csvTypes';

interface ShiftCalendarProps {
  data: ShiftData;
  userName?: string;
}

export default function ShiftCalendar({ data, userName }: ShiftCalendarProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (idx: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const calendarData = useMemo(() => {
    const monthIndex = getMonthIndex(data.month);
    const year = Number(data.year);

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const validDates = Object.keys(data.dates)
      .map(Number)
      .filter(day => day >= 1 && day <= daysInMonth);

    const firstDate = Math.min(...validDates);
    const lastDate = Math.max(...validDates);

    const firstDateObj = new Date(year, monthIndex, firstDate);
    const firstDayOfWeek = firstDateObj.getDay();
    const mondayOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;

    const calendarStart = new Date(firstDateObj);
    calendarStart.setDate(firstDate + mondayOffset);

    const lastDateObj = new Date(year, monthIndex, lastDate);
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

    return { weeks, currentMonth: monthIndex };
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!userName) return data.rows;
    return data.rows.filter(
      (row) => row.nameSurname.toLowerCase() === userName.toLowerCase()
    );
  }, [data.rows, userName]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const isExpanded = (idx: number) => expandedRows.has(idx);

  return (
    <div className="space-y-3">
      {filteredRows.map((row, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => toggleRow(idx)}
            className="w-full bg-[#4F06A7] text-white px-4 py-3 font-semibold flex items-center justify-between hover:bg-[#3d0580] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {isExpanded(idx) ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
              <span>{row.nameSurname}</span>
            </div>
            <span className="text-sm opacity-90">{data.month} {data.year}</span>
          </button>

          {isExpanded(idx) && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {weekDays.map((day, i) => (
                        <th
                          key={day}
                          className={`px-2 py-3 text-sm font-semibold border-b border-r border-gray-200 ${
                            i >= 5 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                          }`}
                          style={{ width: '14.28%' }}
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calendarData.weeks.map((week, weekIdx) => (
                      <tr key={weekIdx} className="h-[85px]">
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
                              className={`border-b border-r border-gray-200 relative transition-colors ${
                                !isCurrentMonth ? 'bg-gray-100' : isWeekendDay ? 'bg-red-50/50' : 'bg-white'
                              }`}
                              style={
                                backgroundColor && isCurrentMonth
                                  ? { backgroundColor }
                                  : undefined
                              }
                            >
                              <span className={`absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-lg z-10 ${
                                isCurrentMonth
                                  ? isWeekendDay
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                  : 'bg-gray-200 text-gray-400'
                              }`}>
                                {day}
                              </span>
                              {isCurrentMonth && shift && shift !== '0' && (
                                <div className="h-full w-full flex items-center justify-center">
                                  <span className="text-3xl font-bold text-gray-800">
                                    {shift}
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#4F06A7]"></span>
                    <span className="text-gray-600">Total Shifts:</span>
                    <span className="font-semibold text-gray-900">{row.totalShifts}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="text-gray-600">Day Shifts:</span>
                    <span className="font-semibold text-gray-900">{row.dayShifts}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600">Night Shifts:</span>
                    <span className="font-semibold text-gray-900">{row.nightShifts}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-600">By Call:</span>
                    <span className="font-semibold text-gray-900">{row.byCall}</span>
                  </div>
                </div>
              </div>
            </>
          )}
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
