import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/useAuth';
import { loadCountries, type Country } from '../lib/configService';
import { Users, Calendar, BarChart, BookOpen, Newspaper, Clock, RefreshCw, Share2, Smartphone, Settings } from 'lucide-react';
import { SchedulePage } from './SchedulePage';
import { DailyMistakesPage } from './DailyMistakesPage';
import { MistakeStatisticsPage } from './MistakeStatisticsPage';
import { TrainingAcademyPage } from './TrainingAcademyPage';
import { NewsPage } from './NewsPage';
import { VisibleMonthsConfig } from '../components/VisibleMonthsConfig';

export function AdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('users');
  const [country, setCountry] = useState<Country | null>(null);

  useEffect(() => {
    loadCountry();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCountry = async () => {
    if (!user?.country_id) return;

    const countries = await loadCountries();
    const userCountry = countries.find(c => c.id === user.country_id);

    if (userCountry) {
      setCountry(userCountry);
    }
  };

  const sections = [
    { id: 'users', label: t('nav.users'), icon: Users },
    { id: 'csv-config', label: 'CSV Configuration', icon: Settings },
    { id: 'schedule', label: t('nav.schedule'), icon: Calendar },
    { id: 'mistake-stats', label: t('nav.mistakeStatistics'), icon: BarChart },
    { id: 'daily-mistakes', label: t('nav.dailyMistakes'), icon: BarChart },
    { id: 'training', label: t('nav.trainingAcademy'), icon: BookOpen },
    { id: 'news', label: t('nav.newsUpdates'), icon: Newspaper },
    { id: 'request-schedule', label: t('nav.requestSchedule'), icon: Clock },
    { id: 'handover', label: t('nav.handoverTakeover'), icon: RefreshCw },
    { id: 'social', label: t('nav.socialMedia'), icon: Share2 },
    { id: 'mobile', label: t('nav.mobileApp'), icon: Smartphone },
  ];

  const renderContent = () => {
    if (!country) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <p className="text-16 mb-2">{t('common.loadingCountryData')}</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'csv-config':
        return <VisibleMonthsConfig countryId={country.id} countryName={country.name} />;
      case 'schedule':
        return <SchedulePage countryName={country.name} countryId={country.id} />;
      case 'daily-mistakes':
        return <DailyMistakesPage countryName={country.name} countryId={country.id} />;
      case 'mistake-stats':
        return <MistakeStatisticsPage countryName={country.name} countryId={country.id} />;
      case 'training':
        return <TrainingAcademyPage countryId={country.id} />;
      case 'news':
        return <NewsPage countryId={country.id} />;
      default:
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              <p className="text-16 mb-2">{t('common.sectionUnderDevelopment')}</p>
              <p className="text-14">{t('common.contentAvailableSoon').replace('{section}', sections.find(s => s.id === activeSection)?.label || '')}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-73px)]">
        <aside className="w-64 bg-white border-r border-gray-200 p-6">
          {country && (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg">
              <div className="text-12 font-semibold text-gray-700 mb-1">{t('common.country')}</div>
              <div className="text-16 font-bold text-amber">{country.name}</div>
            </div>
          )}

          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-14 font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-amber-50 text-amber'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-left">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </Layout>
  );
}
