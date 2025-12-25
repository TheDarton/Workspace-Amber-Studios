import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { Calendar, Search } from 'lucide-react';
import { loadCSVFile, parseShiftData, parseWHData } from '../lib/csvService';
import { getVisibleMonthsForSection, getDisplayCount } from '../lib/configService';
import ShiftCalendar from '../components/ShiftCalendar';
import WHTable from '../components/WHTable';
import type { ShiftData, WHData } from '../lib/csvTypes';

interface PersonData {
  name: string;
  dealerShift?: ShiftData;
  dealerWH?: WHData;
  smShift?: ShiftData;
  smWH?: WHData;
}

export function SchedulePage({ countryName, countryId }: { countryName: string; countryId: string }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(3);
  const [dealerShiftData, setDealerShiftData] = useState<ShiftData | null>(null);
  const [dealerWHData, setDealerWHData] = useState<WHData | null>(null);
  const [smShiftData, setSMShiftData] = useState<ShiftData | null>(null);
  const [smWHData, setSMWHData] = useState<WHData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMonths, setLoadingMonths] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      const visibleMonths = await getVisibleMonthsForSection(countryId, 'schedule');
      const displayCountValue = await getDisplayCount(countryId);

      console.log('[SchedulePage] Loaded months:', visibleMonths, 'Display count:', displayCountValue);

      setMonths(visibleMonths);
      setDisplayCount(displayCountValue);

      if (visibleMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(visibleMonths[0]);
      }
    } catch (error) {
      console.error('[SchedulePage] Error loading visible months:', error);
    } finally {
      setLoadingMonths(false);
    }
  };

  const loadData = async () => {
    console.log('[SchedulePage] loadData called with:', { selectedMonth, countryName, userRole: user?.role });

    if (!selectedMonth || !countryName) {
      console.log('[SchedulePage] loadData aborted: missing selectedMonth or countryName');
      return;
    }

    setLoading(true);

    try {
      if (user?.role !== 'sm') {
        console.log('[SchedulePage] Loading Dealer files...');
        try {
          const shiftCSV = await loadCSVFile(countryName, 'Dealer_Shift', selectedMonth);
          console.log('[SchedulePage] Dealer_Shift loaded, rows:', shiftCSV.length);
          setDealerShiftData(parseShiftData(shiftCSV));
        } catch {
          console.log('[SchedulePage] Dealer_Shift not available');
          setDealerShiftData(null);
        }

        try {
          const whCSV = await loadCSVFile(countryName, 'Dealer_WH', selectedMonth);
          setDealerWHData(parseWHData(whCSV));
        } catch {
          console.log('Dealer_WH not available');
          setDealerWHData(null);
        }
      }

      if (user?.role !== 'dealer') {
        try {
          const shiftCSV = await loadCSVFile(countryName, 'SM_Shift', selectedMonth);
          setSMShiftData(parseShiftData(shiftCSV));
        } catch {
          console.log('SM_Shift not available');
          setSMShiftData(null);
        }

        try {
          const whCSV = await loadCSVFile(countryName, 'SM_WH', selectedMonth);
          setSMWHData(parseWHData(whCSV));
        } catch {
          console.log('SM_WH not available');
          setSMWHData(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const userFullName = user?.name && user?.surname
    ? `${user.name} ${user.surname}`
    : undefined;

  const groupedData = useMemo(() => {
    const peopleMap = new Map<string, PersonData>();

    if (dealerShiftData) {
      dealerShiftData.rows.forEach(row => {
        const name = row.nameSurname;
        if (!peopleMap.has(name)) {
          peopleMap.set(name, { name });
        }
        const person = peopleMap.get(name)!;
        if (!person.dealerShift) {
          person.dealerShift = {
            ...dealerShiftData,
            rows: []
          };
        }
        person.dealerShift.rows.push(row);
      });
    }

    if (dealerWHData) {
      dealerWHData.rows.forEach(row => {
        const name = row.nameSurname;
        if (!peopleMap.has(name)) {
          peopleMap.set(name, { name });
        }
        const person = peopleMap.get(name)!;
        if (!person.dealerWH) {
          person.dealerWH = {
            ...dealerWHData,
            rows: []
          };
        }
        person.dealerWH.rows.push(row);
      });
    }

    if (smShiftData) {
      smShiftData.rows.forEach(row => {
        const name = row.nameSurname;
        if (!peopleMap.has(name)) {
          peopleMap.set(name, { name });
        }
        const person = peopleMap.get(name)!;
        if (!person.smShift) {
          person.smShift = {
            ...smShiftData,
            rows: []
          };
        }
        person.smShift.rows.push(row);
      });
    }

    if (smWHData) {
      smWHData.rows.forEach(row => {
        const name = row.nameSurname;
        if (!peopleMap.has(name)) {
          peopleMap.set(name, { name });
        }
        const person = peopleMap.get(name)!;
        if (!person.smWH) {
          person.smWH = {
            ...smWHData,
            rows: []
          };
        }
        person.smWH.rows.push(row);
      });
    }

    return Array.from(peopleMap.values())
      .filter(person => person.name !== '///' && person.name.trim() !== '')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dealerShiftData, dealerWHData, smShiftData, smWHData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return groupedData;
    const query = searchQuery.toLowerCase();
    return groupedData.filter(person =>
      person.name.toLowerCase().includes(query)
    );
  }, [groupedData, searchQuery]);

  if (loadingMonths) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-6 h-6 text-[#FFA500]" />
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.schedule')}</h1>
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
          <Calendar className="w-6 h-6 text-[#FFA500]" />
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.schedule')}</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No months configured for schedule view</p>
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
          <Calendar className="w-6 h-6 text-[#FFA500]" />
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.schedule')}</h1>
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

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#FFA500] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                {searchQuery ? 'No people found matching your search' : 'No schedule data available for ' + selectedMonth}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-400 mt-2">
                  Upload CSV files to /public/{countryName}/ directory
                </p>
              )}
            </div>
          ) : (
            filteredData.map((person) => (
              <div key={person.name} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 border-b-2 border-[#0891b2] pb-2">
                  {person.name}
                </h2>

                {person.dealerShift && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Dealer Shift Schedule</h3>
                    <ShiftCalendar data={person.dealerShift} />
                  </div>
                )}

                {person.dealerWH && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Dealer Working Hours</h3>
                    <WHTable data={person.dealerWH} />
                  </div>
                )}

                {person.smShift && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">SM Shift Schedule</h3>
                    <ShiftCalendar data={person.smShift} />
                  </div>
                )}

                {person.smWH && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">SM Working Hours</h3>
                    <WHTable data={person.smWH} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
