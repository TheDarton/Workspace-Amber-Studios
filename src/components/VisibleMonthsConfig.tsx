import { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import {
  getAllVisibleMonthsForCountry,
  setVisibleMonth,
  AVAILABLE_MONTHS,
  type SectionType,
} from '../lib/visibleMonthsService';

interface VisibleMonthsConfigProps {
  countryId: string;
  countryName: string;
}

type SectionConfig = {
  month1: string;
  month2: string;
  month3: string;
};

export function VisibleMonthsConfig({ countryId, countryName }: VisibleMonthsConfigProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [scheduleConfig, setScheduleConfig] = useState<SectionConfig>({
    month1: '',
    month2: '',
    month3: '',
  });

  const [mistakeStatsConfig, setMistakeStatsConfig] = useState<SectionConfig>({
    month1: '',
    month2: '',
    month3: '',
  });

  const [dailyMistakesConfig, setDailyMistakesConfig] = useState<SectionConfig>({
    month1: '',
    month2: '',
    month3: '',
  });

  useEffect(() => {
    loadConfigurations();
  }, [countryId]);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const configs = await getAllVisibleMonthsForCountry(countryId);

      setScheduleConfig({
        month1: configs.schedule[0] || '',
        month2: configs.schedule[1] || '',
        month3: configs.schedule[2] || '',
      });

      setMistakeStatsConfig({
        month1: configs.mistake_statistics[0] || '',
        month2: configs.mistake_statistics[1] || '',
        month3: configs.mistake_statistics[2] || '',
      });

      setDailyMistakesConfig({
        month1: configs.daily_mistakes[0] || '',
        month2: configs.daily_mistakes[1] || '',
        month3: configs.daily_mistakes[2] || '',
      });
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
      const updates = [
        { section: 'schedule' as SectionType, config: scheduleConfig },
        { section: 'mistake_statistics' as SectionType, config: mistakeStatsConfig },
        { section: 'daily_mistakes' as SectionType, config: dailyMistakesConfig },
      ];

      for (const { section, config } of updates) {
        if (config.month1) {
          await setVisibleMonth(countryId, section, 1, config.month1);
        }
        if (config.month2) {
          await setVisibleMonth(countryId, section, 2, config.month2);
        }
        if (config.month3) {
          await setVisibleMonth(countryId, section, 3, config.month3);
        }
      }

      setMessage({ type: 'success', text: 'Configurations saved successfully!' });
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

  const renderSectionConfig = (
    title: string,
    config: SectionConfig,
    setConfig: React.Dispatch<React.SetStateAction<SectionConfig>>
  ) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {['month1', 'month2', 'month3'].map((key, index) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority {index + 1}
            </label>
            <select
              value={config[key as keyof SectionConfig]}
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
  );

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
          {saving ? 'Saving...' : 'Save All'}
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Users will see the selected months in the order of priority (1,
          2, 3). You can select up to 3 months per section. Make sure CSV files exist in the{' '}
          <code className="bg-amber-100 px-1 rounded">/public/{countryName}/</code> directory for
          the selected months.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderSectionConfig('Schedule', scheduleConfig, setScheduleConfig)}
        {renderSectionConfig('Mistake Statistics', mistakeStatsConfig, setMistakeStatsConfig)}
        {renderSectionConfig('Daily Mistakes', dailyMistakesConfig, setDailyMistakesConfig)}
      </div>
    </div>
  );
}
