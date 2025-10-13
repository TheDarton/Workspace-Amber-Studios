import { Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const languages = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'lv', label: 'LV', flag: '🇱🇻' },
  { code: 'lt', label: 'LT', flag: '🇱🇹' },
  { code: 'pl', label: 'PL', flag: '🇵🇱' },
  { code: 'ka', label: 'KA', flag: '🇬🇪' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useAuth();

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-14 font-medium cursor-pointer hover:border-amber focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent transition-colors"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
      <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );
}
