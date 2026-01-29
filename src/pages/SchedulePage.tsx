import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { Calendar, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { loadCSVFile, parseShiftData, parseWHData } from '../lib/csvService';
import { getVisibleMonthsForSection, getDisplayCount } from '../lib/visibleMonthsService';
import ShiftCalendar from '../components/ShiftCalendar';
import WHTable from '../components/WHTable';
import type { ShiftData, WHData } from '../lib/csvTypes';

interface PersonData {
  name: string;
  shift?: ShiftData;
  wh?: WHData;
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
  const [expandedPeople, setExpandedPeople] = useState<Set<string>>(new Set());

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

  const togglePerson = (key: string) => {
    setExpandedPeople(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const dealerData = useMemo(() => {
    const peopleMap = new Map<string, PersonData>();

    if (dealerShiftData) {
      dealerShiftData.rows.forEach(row => {
        const name = row.nameSurname;
        if (name === '///' || !name.trim()) return;
        if (!peopleMap.has(name)) {
          peopleMap.set(name, { name });
        }
        const person = peopleMap.get(name)!;
        if (!person.shift) {
          person.shift = {
            ...dealerShiftData,
            rows: []
          };
        }
        person.shift.rows.push(row);
      });
    }

    if (dealerWHData) {
      dealerWHData.rows.forEach(row => {
        const name = row.nameSurname;
        if (name === '///' || !name.trim()) return;
        if (!peopleMap.has(name)) {
          peopleMap.set(name, { name });
        }
        const person = peopleMap.get(name)!;
        if (!person.wh) {
          person.wh = {
            ...dealerWHData,
            rows: []
          };
        }
        person.wh.rows.push(row);
      });
    }

    return Array.from(peopleMap.values());
  }, [dealerShiftData, dealerWHData]);

  const smData = useMemo(() => {
    const peopleMap = new Map<string, PersonData>();

    if (smShiftData) {
      smShiftData.rows.forEach(row => {
        const name = row.nameSurname;
        if (name === '///' || !name.trim()) return;
        if (!peopleMap.has(name)) {
          peopleMap.set(name, { name });
        }
        const person = peopleMap.get(name)!;
        if (!person.shift) {
          person.shift = {
            ...smShiftData,
            rows: []
          };
        }
        person.shift.rows.push(row);
      });
    }

    if (smWHData) {
      smWHData.rows.forEach(row => {
        const name = row.nameSurname;
        if (name === '///' || !name.trim()) return;
        if (!peopleMap.has(name)) {
          peopleMap.set(name, { name });
        }
        const person = peopleMap.get(name)!;
        if (!person.wh) {
          person.wh = {
            ...smWHData,
            rows: []
          };
        }
        person.wh.rows.push(row);
      });
    }

    return Array.from(peopleMap.values());
  }, [smShiftData, smWHData]);

  const filteredDealerData = useMemo(() => {
    if (!searchQuery.trim()) return dealerData;
    const query = searchQuery.toLowerCase();
    return dealerData.filter(person =>
      person.name.toLowerCase().includes(query)
    );
  }, [dealerData, searchQuery]);

  const filteredSMData = useMemo(() => {
    if (!searchQuery.trim()) return smData;
    const query = searchQuery.toLowerCase();
    return smData.filter(person =>
      person.name.toLowerCase().includes(query)
    );
  }, [smData, searchQuery]);

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
          {filteredDealerData.length === 0 && filteredSMData.length === 0 ? (
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
            <>
              {filteredDealerData.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-[#0891b2] pb-2">
                    Dealers
                  </h2>
                  <div className="space-y-3">
                    {filteredDealerData.map((person) => {
                      const key = `dealer-${person.name}`;
                      const isExpanded = expandedPeople.has(key);
                      return (
                        <div key={key} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                          <button
                            onClick={() => togglePerson(key)}
                            className="w-full bg-[#0891b2] text-white px-4 py-3 font-semibold flex items-center gap-3 hover:bg-[#0e7490] transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 flex-shrink-0" />
                            )}
                            <span>{person.name}</span>
                          </button>

                          {isExpanded && (
                            <div className="p-4 space-y-4 bg-gray-50">
                              {person.shift && (
                                <div>
                                  <h3 className="text-md font-semibold text-gray-700 mb-2">Shift Schedule</h3>
                                  <ShiftCalendar data={person.shift} />
                                </div>
                              )}

                              {person.wh && (
                                <div>
                                  <h3 className="text-md font-semibold text-gray-700 mb-2">Working Hours</h3>
                                  <WHTable data={person.wh} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredSMData.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-[#0891b2] pb-2">
                    Shift Managers
                  </h2>
                  <div className="space-y-3">
                    {filteredSMData.map((person) => {
                      const key = `sm-${person.name}`;
                      const isExpanded = expandedPeople.has(key);
                      return (
                        <div key={key} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                          <button
                            onClick={() => togglePerson(key)}
                            className="w-full bg-[#0891b2] text-white px-4 py-3 font-semibold flex items-center gap-3 hover:bg-[#0e7490] transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 flex-shrink-0" />
                            )}
                            <span>{person.name}</span>
                          </button>

                          {isExpanded && (
                            <div className="p-4 space-y-4 bg-gray-50">
                              {person.shift && (
                                <div>
                                  <h3 className="text-md font-semibold text-gray-700 mb-2">Shift Schedule</h3>
                                  <ShiftCalendar data={person.shift} />
                                </div>
                              )}

                              {person.wh && (
                                <div>
                                  <h3 className="text-md font-semibold text-gray-700 mb-2">Working Hours</h3>
                                  <WHTable data={person.wh} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
