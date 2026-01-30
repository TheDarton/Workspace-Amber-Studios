import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { BarChart } from 'lucide-react';
import { loadCSVFile, parseMistakeStats } from '../lib/csvService';
import { getVisibleMonthsForSection, getDisplayCount } from '../lib/visibleMonthsService';
import type { MistakeStatsData, MistakeStatsRow } from '../lib/csvTypes';

interface CategoryTableProps {
  category: { name: string; codes: string[] };
  statsData: MistakeStatsData;
  filteredRows: MistakeStatsRow[];
  selectedMonth: string;
  userRole?: string;
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

function CategoryTable({ category, statsData, filteredRows, selectedMonth, userRole }: CategoryTableProps) {
  const topRightRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);
  const scrollbarWidth = useScrollbarWidth();

  const [hasVerticalScroll, setHasVerticalScroll] = useState(false);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);

  const calculateCategoryTotal = (mistakes: Record<string, string>, codes: string[]): number => {
    return codes.reduce((sum, code) => {
      const value = parseInt(mistakes[code] || '0');
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  };

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
  }, [filteredRows, category.codes]);

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

  const dataContentWidth = category.codes.length * 120;
  const headerPaddingRight = hasVerticalScroll ? scrollbarWidth : 0;
  const leftColumnPaddingBottom = hasHorizontalScroll ? scrollbarWidth : 0;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-[#4F06A7] text-white px-4 py-2 font-semibold">
        {category.name}
      </div>

      <div className="overflow-x-auto">
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gridTemplateRows: 'auto 1fr', minWidth: '800px' }}>
        <div className="bg-blue-100 border-l border-t border-gray-300">
          <div className="border-b border-r border-gray-300">
            <div className={`px-3 py-2 text-lg font-semibold text-gray-700 flex items-center justify-center ${(userRole === 'dealer' || userRole === 'sm') ? 'h-[176px]' : 'h-[216px]'}`}>
              <span>{selectedMonth}</span>
            </div>
          </div>
          {userRole !== 'dealer' && userRole !== 'sm' && (
            <div className="flex">
              <div className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b border-r border-gray-300 bg-blue-100 whitespace-nowrap" style={{ width: '200px' }}>
                Name Surname
              </div>
              <div className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b border-r border-gray-300 bg-blue-100" style={{ width: '100px' }}>
                Nickname
              </div>
              <div className="px-3 py-2 text-center text-sm font-semibold text-gray-900 border-b border-r border-gray-300 bg-blue-100" style={{ width: '80px' }}>
                {(() => {
                  const total = calculateCategoryTotal(statsData.totalRow.mistakes, category.codes);
                  return total === 0 ? '-' : total;
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="flex border-t border-gray-300 overflow-hidden">
          <div
            ref={topRightRef}
            className="overflow-x-scroll overflow-y-hidden bg-gray-100 flex-1 scrollbar-hide"
            onScroll={handleTopRightScroll}
          >
            <div style={{ width: `${dataContentWidth}px` }}>
              <div className={`flex border-b border-gray-300 ${(userRole === 'dealer' || userRole === 'sm') ? 'h-[176px]' : 'h-[216px]'}`}>
                {category.codes.map((code, idx) => (
                  <div key={code} className={`px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-300 align-bottom bg-gray-100 flex items-end justify-center flex-shrink-0 ${idx === 0 ? 'border-l' : ''}`} style={{ width: '120px' }}>
                    <div
                      className="text-sm"
                      style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        textAlign: 'left'
                      }}
                    >
                      {statsData.errorCodes[code]}
                    </div>
                  </div>
                ))}
              </div>
              {userRole !== 'dealer' && userRole !== 'sm' && (
                <div className="flex">
                  {category.codes.map((code, idx) => {
                    const value = statsData.totalRow.mistakes[code] || '0';
                    return (
                      <div key={code} className={`px-3 py-2 text-sm font-semibold text-gray-900 border-r border-b border-gray-300 bg-gray-100 text-center flex-shrink-0 ${idx === 0 ? 'border-l' : ''}`} style={{ width: '120px' }}>
                        {value === '0' ? '-' : value}
                      </div>
                    );
                  })}
                </div>
              )}
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
            {filteredRows.map((row, idx) => {
              const categoryTotal = calculateCategoryTotal(row.mistakes, category.codes);
              return (
                <div key={idx} className="flex">
                  <div className="px-3 py-2 text-sm text-gray-900 border-b border-r border-gray-300 bg-blue-50 whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: '200px' }}>
                    {row.nameSurname}
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-700 border-b border-r border-gray-300 bg-blue-50" style={{ width: '100px' }}>
                    {row.nickname}
                  </div>
                  <div className="px-3 py-2 text-center text-sm font-medium text-gray-900 border-b border-r border-gray-300 bg-blue-50" style={{ width: '80px' }}>
                    {categoryTotal === 0 ? '-' : categoryTotal}
                  </div>
                </div>
              );
            })}
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
            {filteredRows.map((row, idx) => (
              <div key={idx} className="flex">
                {category.codes.map((code, colIdx) => {
                  const value = row.mistakes[code] || '0';
                  const isZero = value === '0' || value === '';
                  return (
                    <div
                      key={code}
                      className={`px-3 py-2 text-center text-sm border-r border-b border-gray-300 flex-shrink-0 ${colIdx === 0 ? 'border-l' : ''} ${
                        !isZero ? 'bg-red-50 text-red-700 font-medium' : 'bg-white'
                      }`}
                      style={{ width: '120px', color: isZero ? 'white' : undefined }}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export function MistakeStatisticsPage({ countryName, countryId }: { countryName: string; countryId: string }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(3);
  const [statsData, setStatsData] = useState<MistakeStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMonths, setLoadingMonths] = useState(true);

  useEffect(() => {
    loadMonths();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

  useEffect(() => {
    if (selectedMonth) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, countryName, user]);

  const loadMonths = async () => {
    setLoadingMonths(true);
    try {
      const visibleMonths = await getVisibleMonthsForSection(countryId, 'mistake_statistics');
      const displayCountValue = await getDisplayCount(countryId);

      console.log('[MistakeStatisticsPage] Loaded months:', visibleMonths, 'Display count:', displayCountValue);

      setMonths(visibleMonths);
      setDisplayCount(displayCountValue);

      if (visibleMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(visibleMonths[0]);
      }
    } catch (error) {
      console.error('[MistakeStatisticsPage] Error loading visible months:', error);
    } finally {
      setLoadingMonths(false);
    }
  };

  const loadData = async () => {
    if (!selectedMonth || !countryName) return;

    setLoading(true);

    try {
      const csvData = await loadCSVFile(countryName, 'Dealer_Stats', selectedMonth);
      setStatsData(parseMistakeStats(csvData));
    } catch {
      console.log('Dealer_Stats not available');
      setStatsData(null);
    } finally {
      setLoading(false);
    }
  };

  const userFullName = user?.name && user?.surname
    ? `${user.name} ${user.surname}`
    : undefined;

  const filteredRows = statsData && userFullName && (user?.role === 'dealer' || user?.role === 'sm')
    ? statsData.rows.filter((row) => row.nameSurname.toLowerCase() === userFullName.toLowerCase())
    : statsData?.rows || [];

  const showTotalRow = user?.role === 'operation';

  if (loadingMonths) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BarChart className="w-6 h-6 text-[#FFA500]" />
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.mistakeStatistics')}</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#FFA500] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (months.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BarChart className="w-6 h-6 text-[#FFA500]" />
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.mistakeStatistics')}</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No months configured for mistake statistics view</p>
          <p className="text-sm text-gray-400 mt-2">
            Contact your admin to configure visible months
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BarChart className="w-6 h-6 text-[#FFA500]" />
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.mistakeStatistics')}</h1>
        </div>

        <div className="flex gap-2">
          {months.slice(0, displayCount).map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedMonth === month
                  ? 'bg-[#FFA500] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#FFA500] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      ) : statsData ? (
        <div className="space-y-6">
          {[
            { name: 'Category 1', codes: statsData.categories.category1 },
            { name: 'Category 2', codes: statsData.categories.category2 },
            { name: 'Category 3', codes: statsData.categories.category3 },
            { name: 'Category 4', codes: statsData.categories.category4 },
            { name: 'Other', codes: statsData.categories.categoryOther },
          ].filter(cat => cat.codes.length > 0).map((category) => (
            <CategoryTable
              key={category.name}
              category={category}
              statsData={statsData}
              filteredRows={filteredRows}
              selectedMonth={selectedMonth!}
              userRole={user?.role}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No mistake statistics available for {selectedMonth}</p>
          <p className="text-sm text-gray-400 mt-2">
            Upload CSV files to /public/{countryName}/ directory
          </p>
        </div>
      )}
    </div>
  );
}
