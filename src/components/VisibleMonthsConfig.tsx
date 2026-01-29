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
      const configs = await getAllVisibleMonthsForCountry(countryId);
      const displayCountValue = await getDisplayCount(countryId);

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
      const sections: SectionType[] = ['schedule', 'mistake_statistics', 'daily_mistakes'];

      for (const section of sections) {
        await setVisibleMonth(countryId, section, 1, config.month1, user);
        await setVisibleMonth(countryId, section, 2, config.month2, user);
        await setVisibleMonth(countryId, section, 3, config.month3, user);
      }

      await setDisplayCount(countryId, displayCount, user);

      await loadConfigurations();
      setMessage({ type: 'success', text: 'Configurations saved successfully for all sections!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving configurations:', error);
      setMessage({ type: 'error', text: 'Failed to save configurations' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 border-4 border-[#FFA500] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Settings className="w-6 h-6 text-[#FFA500]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visible Months Configuration</h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure which months are visible for {countryName}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-[#FFA500] text-white rounded-lg hover:bg-[#FF8C00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The months you select below will apply to{' '}
          <strong>all three sections</strong>: Schedule, Mistake Statistics, and Daily Mistakes.
          Users will see the selected months in the order of priority (1, 2, 3). Make sure CSV
          files exist in the{' '}
          <code className="bg-blue-100 px-1 rounded">/public/{countryName}/</code> directory for
          the selected months.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Display Options
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how many month options to display to users. This controls how many month selection buttons users will see in the interface.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Month Options to Display
          </label>
          <select
            value={displayCount}
            onChange={(e) => setDisplayCountState(Number(e.target.value) as 1 | 2 | 3)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent"
          >
            <option value={1}>1 Month</option>
            <option value={2}>2 Months</option>
            <option value={3}>3 Months</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Users will see the first {displayCount} month{displayCount > 1 ? 's' : ''} from your priority configuration above.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Unified Month Priority Configuration
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Select up to 3 months that will be visible across all sections (Schedule, Mistake
          Statistics, and Daily Mistakes).
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent"
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-amber-900 mb-2">Applied To:</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Schedule Section</li>
          <li>• Mistake Statistics Section</li>
          <li>• Daily Mistakes Section</li>
        </ul>
        <p className="text-xs text-amber-700 mt-3">
          All three sections will display the same months in the same priority order.
        </p>
      </div>
    </div>
  );
}
