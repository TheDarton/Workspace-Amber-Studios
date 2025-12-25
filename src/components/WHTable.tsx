import { useState, useEffect, useRef } from 'react';
import type { WHData } from '../lib/csvTypes';
import { isWeekend } from '../lib/csvTypes';

interface WHTableProps {
  data: WHData;
  userName?: string;
}

function useScrollbarWidth() {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const width = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);

    setScrollbarWidth(width);
  }, []);

  return scrollbarWidth;
}

export default function WHTable({ data, userName }: WHTableProps) {
  const topRightRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);
  const scrollbarWidth = useScrollbarWidth();

  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);

  interface GroupedRow {
    name: string;
    dayRow: WHData['rows'][0];
    nightRow: WHData['rows'][0] | null;
  }

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

  useEffect(() => {
    const checkScrollbars = () => {
      if (bottomRightRef.current) {
        const el = bottomRightRef.current;
        setHasVerticalScroll(el.scrollHeight > el.clientHeight);
        setHasHorizontalScroll(el.scrollWidth > el.clientWidth);
      }
    };

    checkScrollbars();
    window.addEventListener('resize', checkScrollbars);
    return () => window.removeEventListener('resize', checkScrollbars);
  }, [groupedRows, validDays]);

  const handleBottomRightScroll = () => {
    if (!bottomRightRef.current) return;
    if (topRightRef.current) {
      topRightRef.current.scrollLeft = bottomRightRef.current.scrollLeft;
    }
    if (bottomLeftRef.current) {
      bottomLeftRef.current.scrollTop = bottomRightRef.current.scrollTop;
    }
  };

  const handleBottomLeftScroll = () => {
    if (!bottomLeftRef.current) return;
    if (bottomRightRef.current) {
      bottomRightRef.current.scrollTop = bottomLeftRef.current.scrollTop;
    }
  };

  const handleTopRightScroll = () => {
    if (!topRightRef.current) return;
    if (bottomRightRef.current) {
      bottomRightRef.current.scrollLeft = topRightRef.current.scrollLeft;
    }
  };

  const dataContentWidth = validDays.length * 50;
  const headerPaddingRight = hasVerticalScroll ? scrollbarWidth : 0;
  const leftColumnPaddingBottom = hasHorizontalScroll ? scrollbarWidth : 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-[#0891b2] text-white px-4 py-2 font-semibold">
        Working Hours - {data.month} {data.year}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gridTemplateRows: 'auto 1fr' }}>
        <div className="bg-blue-100 border-l border-t border-gray-300">
          <div className="flex border-b border-r border-gray-300" style={{ height: '80px' }}>
            <div className="px-3 py-2 text-sm font-medium text-gray-700 flex items-center justify-center bg-blue-100" style={{ width: '200px' }}>
              Name Surname
            </div>
            <div className="px-3 py-2 text-sm font-medium text-gray-700 flex items-center justify-center border-l border-gray-300 bg-blue-100" style={{ width: '70px' }}>
              Day/Night
            </div>
            <div className="px-3 py-2 text-sm font-medium text-gray-700 flex items-center justify-center border-l border-gray-300 bg-blue-100" style={{ width: '70px', borderRight: '2px solid #6b7280' }}>
              Total
            </div>
          </div>
        </div>

        <div className="flex border-t border-gray-300 overflow-hidden">
          <div
            ref={topRightRef}
            className="overflow-x-scroll overflow-y-hidden bg-gray-100 flex-1 scrollbar-hide"
            onScroll={handleTopRightScroll}
          >
            <div style={{ width: `${dataContentWidth}px` }}>
              <div className="flex border-b border-gray-300" style={{ height: '80px' }}>
                {validDays.map((day, idx) => {
                  const weekday = data.weekdays[day];
                  const weekend = isWeekend(weekday);
                  return (
                    <div
                      key={day}
                      className={`px-1 py-2 text-sm font-medium border-r border-gray-300 flex flex-col items-center justify-end flex-shrink-0 ${weekend ? 'bg-red-100' : 'bg-gray-100'}`}
                      style={{ width: '50px', borderLeft: idx === 0 ? '2px solid #6b7280' : undefined }}
                    >
                      <div className="text-lg font-semibold text-gray-800">{day}</div>
                      <div className={`text-xs ${weekend ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{weekday}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bg-gray-100" style={{ width: `${headerPaddingRight}px`, flexShrink: 0 }}></div>
        </div>

        <div className="flex flex-col border-l border-gray-300" style={{ maxHeight: '400px' }}>
          <div
            ref={bottomLeftRef}
            className="overflow-y-scroll overflow-x-hidden bg-blue-50 flex-1 scrollbar-hide"
            onScroll={handleBottomLeftScroll}
          >
            {groupedRows.map((group, idx) => (
              <div key={idx} className="flex" style={{ borderBottom: '2px solid #6b7280' }}>
                <div className="px-3 py-2 text-sm text-gray-900 border-r border-gray-300 bg-blue-50 whitespace-nowrap overflow-hidden text-ellipsis flex items-center" style={{ width: '200px', height: '72px' }}>
                  {group.name}
                </div>
                <div className="flex flex-col">
                  <div className="flex">
                    <div className="px-2 py-2 text-xs text-gray-600 border-b border-r border-gray-300 bg-amber-50 flex items-center justify-center" style={{ width: '70px', height: '36px' }}>
                      Day
                    </div>
                    <div className="px-2 py-2 text-sm font-medium text-gray-900 border-b border-gray-300 bg-amber-50 flex items-center justify-center" style={{ width: '70px', height: '36px', borderRight: '2px solid #6b7280' }}>
                      {group.dayRow.totalHours}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="px-2 py-2 text-xs text-gray-600 border-r border-gray-300 bg-blue-100 flex items-center justify-center" style={{ width: '70px', height: '36px' }}>
                      Night
                    </div>
                    <div className="px-2 py-2 text-sm font-medium text-gray-900 border-gray-300 bg-blue-100 flex items-center justify-center" style={{ width: '70px', height: '36px', borderRight: '2px solid #6b7280' }}>
                      {group.nightRow?.totalHours || '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border-r border-gray-300" style={{ height: `${leftColumnPaddingBottom}px`, flexShrink: 0 }}></div>
        </div>

        <div
          ref={bottomRightRef}
          className="overflow-auto bg-white"
          style={{ maxHeight: '400px' }}
          onScroll={handleBottomRightScroll}
        >
          <div style={{ width: `${dataContentWidth}px` }}>
            {groupedRows.map((group, rowIdx) => (
              <div key={rowIdx} style={{ borderBottom: '2px solid #6b7280' }}>
                <div className="flex">
                  {validDays.map((day, colIdx) => {
                    const weekday = data.weekdays[day];
                    const weekend = isWeekend(weekday);
                    const value = group.dayRow.hours[day] || '';
                    const hasValue = value !== '' && value !== '0';
                    return (
                      <div
                        key={day}
                        className={`px-1 py-2 text-center text-sm border-r border-b border-gray-300 flex-shrink-0 ${
                          hasValue ? 'bg-amber-50 font-medium text-gray-900' : weekend ? 'bg-red-50/30' : 'bg-white'
                        }`}
                        style={{ width: '50px', height: '36px', color: !hasValue ? 'transparent' : undefined, borderLeft: colIdx === 0 ? '2px solid #6b7280' : undefined }}
                      >
                        {value || '0'}
                      </div>
                    );
                  })}
                </div>
                <div className="flex">
                  {validDays.map((day, colIdx) => {
                    const weekday = data.weekdays[day];
                    const weekend = isWeekend(weekday);
                    const value = group.nightRow?.hours[day] || '';
                    const hasValue = value !== '' && value !== '0';
                    return (
                      <div
                        key={day}
                        className={`px-1 py-2 text-center text-sm border-r border-gray-300 flex-shrink-0 ${
                          hasValue ? 'bg-blue-50 font-medium text-gray-900' : weekend ? 'bg-red-50/30' : 'bg-white'
                        }`}
                        style={{ width: '50px', height: '36px', color: !hasValue ? 'transparent' : undefined, borderLeft: colIdx === 0 ? '2px solid #6b7280' : undefined }}
                      >
                        {value || '0'}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
