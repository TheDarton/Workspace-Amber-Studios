import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/useAuth';
import { loadCountries, type Country } from '../lib/configService';
import { Calendar, BarChart, BookOpen, Newspaper, Clock, RefreshCw, Menu, X } from 'lucide-react';
import { SchedulePage } from './SchedulePage';
import { DailyMistakesPage } from './DailyMistakesPage';
import { MistakeStatisticsPage } from './MistakeStatisticsPage';
import { TrainingAcademyPage } from './TrainingAcademyPage';
import { NewsPage } from './NewsPage';

export function UserPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('schedule');
  const [country, setCountry] = useState<Country | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const getSections = () => {
    const baseSections = [
      { id: 'schedule', label: t('nav.schedule'), icon: Calendar },
      { id: 'daily-mistakes', label: t('nav.dailyMistakes'), icon: BarChart },
    ];

    if (user?.role === 'dealer' || user?.role === 'sm' || user?.role === 'operation') {
      baseSections.push({ id: 'mistake-stats', label: t('nav.mistakeStatistics'), icon: BarChart });
    }

    baseSections.push({ id: 'training', label: t('nav.trainingAcademy'), icon: BookOpen });
    baseSections.push({ id: 'news', label: t('nav.newsUpdates'), icon: Newspaper });

    if (user?.role === 'dealer' || user?.role === 'sm') {
      baseSections.push({ id: 'request-schedule', label: t('nav.requestSchedule'), icon: Clock });
    }

    if (user?.role === 'sm' || user?.role === 'operation') {
      baseSections.push({ id: 'handover', label: t('nav.handoverTakeover'), icon: RefreshCw });
    }

    return baseSections;
  };

  const sections = getSections();

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    if (!country) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <p className="text-16 mb-2">Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
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
              <p className="text-16 mb-2">This section is under development</p>
              <p className="text-14">Content for {sections.find(s => s.id === activeSection)?.label} will be available soon</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-73px)] relative">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-[#FFA500] text-white p-3 rounded-full shadow-lg hover:bg-[#FF8C00] transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {sidebarOpen && (
          <div
            className="lg:hidden fixed top-[57px] sm:top-[65px] inset-x-0 bottom-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:relative top-[57px] sm:top-[65px] lg:top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 p-4 lg:p-6
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-13 lg:text-14 font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-amber-50 text-amber'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-left truncate">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </Layout>
  );
}
