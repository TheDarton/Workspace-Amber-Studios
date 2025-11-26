import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { BarChart } from 'lucide-react';
import { loadCSVFile, parseDailyStats } from '../lib/csvService';
import { getVisibleMonthsForSection, getDisplayCount } from '../lib/configService';
import type { DailyStatsData } from '../lib/csvTypes';
import { isWeekend } from '../lib/csvTypes';

export function DailyMistakesPage({ countryName, countryId }: { countryName: string; countryId: string }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(3);
  const [statsData, setStatsData] = useState<DailyStatsData | null>(null);
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
      const visibleMonths = await getVisibleMonthsForSection(countryId, 'daily_mistakes');
      const displayCountValue = await getDisplayCount(countryId);

      console.log('[DailyMistakesPage] Loaded months:', visibleMonths, 'Display count:', displayCountValue);

      setMonths(visibleMonths);
      setDisplayCount(displayCountValue);

      if (visibleMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(visibleMonths[0]);
      }
    } catch (error) {
      console.error('[DailyMistakesPage] Error loading visible months:', error);
    } finally {
      setLoadingMonths(false);
    }
  };

  const loadData = async () => {
    if (!selectedMonth || !countryName) return;

    setLoading(true);

    try {
      const csvData = await loadCSVFile(countryName, 'Daily_Stats', selectedMonth);
      setStatsData(parseDailyStats(csvData));
    } catch {
      console.log('Daily_Stats not available');
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

  const validDays = statsData
    ? Object.keys(statsData.dates)
        .map(Number)
        .sort((a, b) => a - b)
        .filter((day) => statsData.dates[day] && statsData.dates[day] !== '')
    : [];

  if (loadingMonths) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BarChart className="w-6 h-6 text-[#FFA500]" />
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.dailyMistakes')}</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.dailyMistakes')}</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No months configured for daily mistakes view</p>
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
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.dailyMistakes')}</h1>
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
          <p className="text-gray-600">Loading daily mistakes...</p>
        </div>
      ) : statsData ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th rowSpan={3} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">
                    Name Surname
                  </th>
                  <th rowSpan={3} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">
                    Nickname
                  </th>
                  <th
                    colSpan={2}
                    className="px-4 py-2 text-center text-sm font-medium text-white border bg-[#FFA500]"
                  >
                    {statsData.month} {statsData.year}
                  </th>
                  {validDays.map((day) => (
                    <th key={day} className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">
                      {day}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border"></th>
                  <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">Total</th>
                  {validDays.map((day) => {
                    const date = statsData.dates[day];
                    return (
                      <th key={day} className="px-2 py-1 text-center text-xs text-gray-600 border">
                        {date}
                      </th>
                    );
                  })}
                </tr>
                <tr>
                  <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border"></th>
                  <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border"></th>
                  {validDays.map((day) => {
                    const weekday = statsData.weekdays[day];
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
                </tr>
              </thead>
              <tbody className="bg-white">
                {showTotalRow && (
                  <tr className="bg-amber-50 font-semibold">
                    <td colSpan={2} className="px-4 py-2 text-sm border">
                      Total
                    </td>
                    <td className="px-4 py-2 text-center text-sm border">{statsData.totalRow.total}</td>
                    {validDays.map((day) => (
                      <td key={day} className="px-3 py-2 text-center text-sm border">
                        {statsData.totalRow.days[day] || '0'}
                      </td>
                    ))}
                  </tr>
                )}
                {filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900 border">{row.nameSurname}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 border">{row.nickname}</td>
                    <td className="px-4 py-2 text-center text-sm font-medium text-gray-900 border">
                      {row.total}
                    </td>
                    {validDays.map((day) => {
                      const value = row.days[day] || '0';
                      return (
                        <td
                          key={day}
                          className={`px-3 py-2 text-center text-sm border ${
                            value !== '0' && value !== '-' && value !== '' ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {value === '-' ? '' : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No daily mistakes available for {selectedMonth}</p>
          <p className="text-sm text-gray-400 mt-2">
            Upload CSV files to /public/{countryName}/ directory
          </p>
        </div>
      )}
    </div>
  );
}
