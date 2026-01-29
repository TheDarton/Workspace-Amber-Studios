import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import {
  getAllVisibleMonthsForCountry,
  setVisibleMonth,
  getDisplayCount,
  setDisplayCount,
  AVAILABLE_MONTHS,
  type SectionType,
} from '../lib/visibleMonthsService';
import { useAuth } from '../contexts/useAuth';

interface VisibleMonthsConfigProps {
  countryId: string;
  countryName: string;
}

type UnifiedConfig = {
  month1: string;
  month2: string;
  month3: string;
};

export function VisibleMonthsConfig({ countryId, countryName }: VisibleMonthsConfigProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [config, setConfig] = useState<UnifiedConfig>({
    month1: '',
    month2: '',
    month3: '',
  });

  const [displayCount, setDisplayCountState] = useState<1 | 2 | 3>(3);

  useEffect(() => {
    loadConfigurations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      console.log('[VisibleMonthsConfig] Loading configurations for country:', countryId);
      const configs = await getAllVisibleMonthsForCountry(countryId);
      const displayCountValue = await getDisplayCount(countryId);

      console.log('[VisibleMonthsConfig] Loaded configs:', configs);
      console.log('[VisibleMonthsConfig] Display count:', displayCountValue);

      setConfig({
        month1: configs.schedule[0] || '',
        month2: configs.schedule[1] || '',
        month3: configs.schedule[2] || '',
      });

      setDisplayCountState(displayCountValue as 1 | 2 | 3);
    } catch (error) {
      console.error('Error loading configurations:', error);
      setMessage({ type: 'error', text: 'Failed to load configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      console.log('[VisibleMonthsConfig] Starting save with user:', user?.role, 'country:', countryId);
      console.log('[VisibleMonthsConfig] Config to save:', config);

      const sections: SectionType[] = ['schedule', 'mistake_statistics', 'daily_mistakes'];
      let allSuccess = true;
      const errors: string[] = [];

      for (const section of sections) {
        const results = await Promise.all([
          setVisibleMonth(countryId, section, 1, config.month1, user),
          setVisibleMonth(countryId, section, 2, config.month2, user),
          setVisibleMonth(countryId, section, 3, config.month3, user),
        ]);

        console.log(`[VisibleMonthsConfig] Save results for ${section}:`, results);

        if (results.some(r => r === false)) {
          allSuccess = false;
          errors.push(`Failed to save ${section} configuration`);
        }
      }

      const displayCountResult = await setDisplayCount(countryId, displayCount, user);
      console.log('[VisibleMonthsConfig] Display count save result:', displayCountResult);

      if (!displayCountResult) {
        allSuccess = false;
        errors.push('Failed to save display count');
      }

      if (allSuccess) {
        await loadConfigurations();
        setMessage({ type: 'success', text: 'Configurations saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        console.error('[VisibleMonthsConfig] Save errors:', errors);
        setMessage({ type: 'error', text: errors.join('. ') || 'Failed to save some configurations' });
      }
    } catch (error) {
      console.error('Error saving configurations:', error);
      setMessage({ type: 'error', text: 'Failed to save configurations' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#FFA500] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm sm:text-base">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFA500] flex-shrink-0 mt-1 sm:mt-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Visible Months</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Configure months for {countryName}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2 bg-[#FFA500] text-white rounded-lg hover:bg-[#FF8C00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start sm:items-center gap-2 p-3 sm:p-4 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>Note:</strong> Settings apply to all sections: Schedule, Mistake Statistics, and Daily Mistakes.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Display Options
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Months to Display
          </label>
          <select
            value={displayCount}
            onChange={(e) => setDisplayCountState(Number(e.target.value) as 1 | 2 | 3)}
            className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent text-base"
          >
            <option value={1}>1 Month</option>
            <option value={2}>2 Months</option>
            <option value={3}>3 Months</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Month Priority
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          Select months in order of priority.
        </p>
        <div className="space-y-4">
          {['month1', 'month2', 'month3'].map((key, index) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority {index + 1}
              </label>
              <select
                value={config[key as keyof UnifiedConfig]}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent text-base"
              >
                <option value="">-- Select Month --</option>
                {AVAILABLE_MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs sm:text-sm font-semibold text-amber-900 mb-2">Applied To:</h4>
        <ul className="text-xs sm:text-sm text-amber-800 space-y-1">
          <li>Schedule</li>
          <li>Mistake Statistics</li>
          <li>Daily Mistakes</li>
        </ul>
      </div>
    </div>
  );
}
