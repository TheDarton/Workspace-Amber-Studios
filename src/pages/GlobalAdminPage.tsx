import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useTranslation } from '../hooks/useTranslation';
import { type Country } from '../lib/configService';
import { Plus, Settings, Globe, Users, Trash2, Edit2, Calendar, BarChart, BookOpen, Newspaper, Clock, RefreshCw, Share2, Smartphone, Menu, X } from 'lucide-react';
import { SchedulePage } from './SchedulePage';
import { DailyMistakesPage } from './DailyMistakesPage';
import { MistakeStatisticsPage } from './MistakeStatisticsPage';
import { TrainingAcademyPage } from './TrainingAcademyPage';
import { NewsPage } from './NewsPage';
import { VisibleMonthsConfig } from '../components/VisibleMonthsConfig';
import { useAuth } from '../contexts/useAuth';
import { supabase } from '../lib/supabase';

interface Admin {
  id: string;
  login: string;
  name: string | null;
  surname: string | null;
  email: string | null;
  country_id: string | null;
  role: string;
}

export function GlobalAdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'add-country' | 'add-admin' | 'settings'>('add-country');
  const [countries, setCountries] = useState<Country[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [countryName, setCountryName] = useState('');
  const [countryPrefix, setCountryPrefix] = useState('');
  const [adminCountry, setAdminCountry] = useState('');
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminSurname, setAdminSurname] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profileName, setProfileName] = useState('');
  const [profileSurname, setProfileSurname] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [newPasswordSettings, setNewPasswordSettings] = useState('');
  const [confirmPasswordSettings, setConfirmPasswordSettings] = useState('');

  useEffect(() => {
    loadCountries();
    loadAdmins();
    loadUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('users')
      .select('name, surname, email')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfileName(data.name || '');
      setProfileSurname(data.surname || '');
      setProfileEmail(data.email || '');
    }
  };

  const loadCountries = async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name');

    if (!error && data) {
      setCountries(data);
    }
  };

  const loadAdmins = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .order('login');

    if (!error && data) {
      setAdmins(data);
    }
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const { error } = await supabase
      .from('countries')
      .insert({
        name: countryName,
        prefix: countryPrefix,
      });

    if (error) {
      setMessage({ type: 'error', text: t('countries.errorAdding') });
    } else {
      setMessage({ type: 'success', text: t('countries.countryAdded') });
      setCountryName('');
      setCountryPrefix('');
      loadCountries();
    }
  };

  const handleDeleteCountry = async (countryId: string) => {
    if (!confirm(t('countries.confirmDelete'))) return;

    const { error } = await supabase
      .from('countries')
      .delete()
      .eq('id', countryId);

    if (!error) {
      loadCountries();
      setMessage({ type: 'success', text: t('countries.countryDeleted') });
    } else {
      setMessage({ type: 'error', text: t('countries.errorDeleting') });
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const { error } = await supabase
      .from('users')
      .insert({
        country_id: adminCountry,
        role: 'admin',
        login: adminLogin,
        password_hash: `hashed_${adminPassword}`,
        name: adminName || null,
        surname: adminSurname || null,
        email: adminEmail || null,
        must_change_password: false,
      });

    if (error) {
      setMessage({ type: 'error', text: t('admins.errorAdding') });
    } else {
      setMessage({ type: 'success', text: t('admins.adminAdded') });
      setAdminLogin('');
      setAdminPassword('');
      setAdminName('');
      setAdminSurname('');
      setAdminEmail('');
      setAdminCountry('');
      loadAdmins();
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setAdminCountry(admin.country_id || '');
    setAdminLogin(admin.login);
    setAdminPassword('');
    setAdminName(admin.name || '');
    setAdminSurname(admin.surname || '');
    setAdminEmail(admin.email || '');
    setActiveTab('add-admin');
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!editingAdmin) return;

    const updateData: Record<string, string | null> = {
      country_id: adminCountry,
      login: adminLogin,
      name: adminName || null,
      surname: adminSurname || null,
      email: adminEmail || null,
    };

    if (adminPassword) {
      updateData.password_hash = `hashed_${adminPassword}`;
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', editingAdmin.id);

    if (error) {
      setMessage({ type: 'error', text: t('admins.errorUpdating') });
    } else {
      setMessage({ type: 'success', text: t('admins.adminUpdated') });
      setEditingAdmin(null);
      setAdminLogin('');
      setAdminPassword('');
      setAdminName('');
      setAdminSurname('');
      setAdminEmail('');
      setAdminCountry('');
      loadAdmins();
    }
  };

  const handleCancelEdit = () => {
    setEditingAdmin(null);
    setAdminLogin('');
    setAdminPassword('');
    setAdminName('');
    setAdminSurname('');
    setAdminEmail('');
    setAdminCountry('');
    setMessage(null);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm(t('admins.confirmDelete'))) return;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', adminId);

    if (!error) {
      loadAdmins();
      setMessage({ type: 'success', text: t('admins.adminDeleted') });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!user?.id) return;

    const { error } = await supabase
      .from('users')
      .update({
        name: profileName || null,
        surname: profileSurname || null,
        email: profileEmail || null,
      })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: t('settings.errorUpdatingProfile') });
    } else {
      setMessage({ type: 'success', text: t('settings.profileUpdated') });
    }
  };

  const handleChangePasswordSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!user?.id) return;

    if (newPasswordSettings !== confirmPasswordSettings) {
      setMessage({ type: 'error', text: t('settings.passwordsDoNotMatch') });
      return;
    }

    if (newPasswordSettings.length < 8) {
      setMessage({ type: 'error', text: t('settings.passwordTooShort') });
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({
        password_hash: `hashed_${newPasswordSettings}`,
      })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: t('settings.errorChangingPassword') });
    } else {
      setMessage({ type: 'success', text: t('settings.passwordUpdated') });
      setNewPasswordSettings('');
      setConfirmPasswordSettings('');
    }
  };

  const getCountryName = (countryId: string | null) => {
    if (!countryId) return t('admins.nameNotAvailable');
    const country = countries.find(c => c.id === countryId);
    return country?.name || t('admins.countryUnknown');
  };

  const adminSections = [
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

  const renderCountryAdminContent = () => {
    const country = countries.find(c => c.id === selectedCountry);
    if (!country) return null;

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
              <p className="text-14">{t('common.contentAvailableSoon').replace('{section}', adminSections.find(s => s.id === activeSection)?.label || '')}</p>
            </div>
          </div>
        );
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
  };

  const handleTabChange = (tab: 'add-country' | 'add-admin' | 'settings') => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleCountrySelection = (countryId: string) => {
    setSelectedCountry(countryId);
    setSidebarOpen(false);
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
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 p-4 lg:p-6
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          {selectedCountry ? (
            <>
              <div className="mb-4 lg:mb-6">
                <div className="p-3 lg:p-4 bg-amber-50 rounded-lg mb-4">
                  <div className="text-11 lg:text-12 font-semibold text-gray-700 mb-1">{t('common.viewingAsAdmin')}</div>
                  <div className="text-14 lg:text-16 font-bold text-amber">
                    {countries.find(c => c.id === selectedCountry)?.name}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCountry('');
                    setActiveSection('users');
                    setSidebarOpen(false);
                  }}
                  className="w-full px-4 py-2 text-13 lg:text-14 text-amber hover:bg-amber-50 rounded-lg transition-colors"
                >
                  {t('common.backToGlobalAdmin')}
                </button>
              </div>
              <nav className="space-y-1">
                {adminSections.map((section) => {
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
            </>
          ) : (
            <>
              <nav className="space-y-2">
                <button
                  onClick={() => handleTabChange('add-country')}
                  className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-13 lg:text-14 font-medium transition-colors ${
                    activeTab === 'add-country'
                      ? 'bg-amber-50 text-amber'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Globe className="w-5 h-5 flex-shrink-0" />
                  <span className="text-left truncate">{t('nav.addCountry')}</span>
                </button>

                <button
                  onClick={() => handleTabChange('add-admin')}
                  className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-13 lg:text-14 font-medium transition-colors ${
                    activeTab === 'add-admin'
                      ? 'bg-amber-50 text-amber'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  <span className="text-left truncate">{t('nav.addAdmin')}</span>
                </button>

                <button
                  onClick={() => handleTabChange('settings')}
                  className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-13 lg:text-14 font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-amber-50 text-amber'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span className="text-left truncate">{t('nav.settings')}</span>
                </button>
              </nav>

              {countries.length > 0 && (
                <div className="mt-6 lg:mt-8">
                  <label className="block text-11 lg:text-12 font-semibold text-gray-700 mb-2 uppercase">
                    {t('nav.selectCountry')}
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountrySelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-13 lg:text-14 focus:outline-none focus:ring-2 focus:ring-amber"
                  >
                    <option value="">{t('common.select')}</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </aside>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {selectedCountry ? (
            <div className="w-full max-w-6xl">
              {renderCountryAdminContent()}
            </div>
          ) : (
            <>
              {activeTab === 'add-country' && (
                <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('countries.addCountry')}</h1>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 max-w-2xl">
                <form onSubmit={handleAddCountry} className="space-y-6">
                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('countries.countryName')}
                    </label>
                    <input
                      type="text"
                      value={countryName}
                      onChange={(e) => setCountryName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('countries.prefix')}
                    </label>
                    <input
                      type="text"
                      value={countryPrefix}
                      onChange={(e) => setCountryPrefix(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-amber hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t('countries.addButton')}
                  </button>
                </form>
              </div>

              {countries.length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{t('countries.countriesList')}</h2>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">{t('common.name')}</th>
                          <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">{t('common.prefix')}</th>
                          <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {countries.map((country) => (
                          <tr key={country.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-14">{country.name}</td>
                            <td className="px-6 py-4 text-14">{country.prefix}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteCountry(country.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
                </div>
              )}

              {activeTab === 'add-admin' && (
                <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                {editingAdmin ? t('admins.editAdministrator') : t('admins.addAdministrator')}
              </h1>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 max-w-2xl">
                <form onSubmit={editingAdmin ? handleUpdateAdmin : handleAddAdmin} className="space-y-6">
                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('admins.country')}
                    </label>
                    <select
                      value={adminCountry}
                      onChange={(e) => setAdminCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                      required
                    >
                      <option value="">{t('admins.selectCountry')}</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('admins.login')}
                    </label>
                    <input
                      type="text"
                      value={adminLogin}
                      onChange={(e) => setAdminLogin(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {editingAdmin ? t('admins.passwordOptional') : t('admins.password')}
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                      required={!editingAdmin}
                    />
                  </div>

                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('admins.name')}
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('admins.surname')}
                    </label>
                    <input
                      type="text"
                      value={adminSurname}
                      onChange={(e) => setAdminSurname(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('admins.email')}
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-amber hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      {editingAdmin ? t('admins.updateButton') : t('admins.addButton')}
                    </button>
                    {editingAdmin && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
                      >
                        {t('admins.cancel')}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {admins.length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{t('admins.adminList')}</h2>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">{t('admins.tableHeaderLogin')}</th>
                          <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">{t('admins.tableHeaderName')}</th>
                          <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">{t('admins.tableHeaderCountry')}</th>
                          <th className="px-6 py-3 text-left text-12 font-semibold text-gray-700 uppercase">{t('admins.tableHeaderActions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {admins.map((admin) => (
                          <tr key={admin.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-14">{admin.login}</td>
                            <td className="px-6 py-4 text-14">
                              {admin.name && admin.surname ? `${admin.name} ${admin.surname}` : t('admins.nameNotAvailable')}
                            </td>
                            <td className="px-6 py-4 text-14">{getCountryName(admin.country_id)}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditAdmin(admin)}
                                  className="p-2 text-gray-600 hover:text-amber hover:bg-amber-50 rounded transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t('settings.title')}</h1>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 max-w-2xl mb-6">
                <h2 className="text-18 font-bold text-gray-900 mb-4">{t('settings.profileInformation')}</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('settings.name')}
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('settings.surname')}
                    </label>
                    <input
                      type="text"
                      value={profileSurname}
                      onChange={(e) => setProfileSurname(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('settings.email')}
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-amber hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    {t('settings.updateProfile')}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 max-w-2xl">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">{t('settings.changePassword')}</h2>
                <form onSubmit={handleChangePasswordSettings} className="space-y-4">
                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('settings.newPassword')}
                    </label>
                    <input
                      type="password"
                      value={newPasswordSettings}
                      onChange={(e) => setNewPasswordSettings(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-14 font-medium text-gray-700 mb-2">
                      {t('settings.confirmNewPassword')}
                    </label>
                    <input
                      type="password"
                      value={confirmPasswordSettings}
                      onChange={(e) => setConfirmPasswordSettings(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-amber hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    {t('settings.changePassword')}
                  </button>
                </form>
              </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </Layout>
  );
}
