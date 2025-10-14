import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { BarChart } from 'lucide-react';
import { loadCSVFile, parseMistakeStats } from '../lib/csvService';
import { getVisibleMonthsForSection, getDisplayCount } from '../lib/visibleMonthsService';
import type { MistakeStatsData } from '../lib/csvTypes';

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
  }, [countryId]);

  useEffect(() => {
    if (selectedMonth) {
      loadData();
    }
  }, [selectedMonth, countryName, user]);

  const loadMonths = async () => {
    setLoadingMonths(true);
    try {
      const visibleMonths = await getVisibleMonthsForSection(countryId, 'mistake_statistics');
      const displayCountValue = await getDisplayCount(countryId);
      setMonths(visibleMonths);
      setDisplayCount(displayCountValue);
      if (visibleMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(visibleMonths[0]);
      }
    } catch (error) {
      console.error('Error loading visible months:', error);
      setMonths(['September', 'October', 'November']);
      setDisplayCount(3);
      setSelectedMonth('September');
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
    } catch (err) {
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
            <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-[#4F06A7] text-white px-4 py-2 font-semibold">
                {category.name}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Name Surname</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border">Nickname</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border">Total</th>
                      {category.codes.map((code) => (
                        <th key={code} className="px-3 py-2 text-center text-sm font-medium text-gray-700 border">
                          <div>{code}</div>
                          <div className="text-xs font-normal text-gray-500 mt-1">
                            {statsData.errorCodes[code]}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {showTotalRow && (
                      <tr className="bg-amber-50 font-semibold">
                        <td colSpan={2} className="px-4 py-2 text-sm border">
                          {statsData.month} {statsData.year}
                        </td>
                        <td className="px-4 py-2 text-center text-sm border">
                          {statsData.totalRow.total}
                        </td>
                        {category.codes.map((code) => (
                          <td key={code} className="px-3 py-2 text-center text-sm border">
                            {statsData.totalRow.mistakes[code] || '0'}
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
                        {category.codes.map((code) => {
                          const value = row.mistakes[code] || '0';
                          return (
                            <td
                              key={code}
                              className={`px-3 py-2 text-center text-sm border ${
                                value !== '0' && value !== '' ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-700'
                              }`}
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
            </div>
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
