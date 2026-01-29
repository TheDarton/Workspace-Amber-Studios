import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { signIn, updatePassword } from '../lib/auth';
import { useAuth } from '../contexts/useAuth';

export function LoginPage() {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [tempUserId, setTempUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, error: authError } = await signIn(login, password);

      if (authError || !user) {
        setError(t('login.invalidCredentials'));
        return;
      }

      if (user.must_change_password) {
        setTempUserId(user.id);
        setShowChangePassword(true);
        return;
      }

      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('login.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('login.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await updatePassword(tempUserId, newPassword);

      if (updateError) {
        setError(updateError);
        return;
      }

      const { user, error: authError } = await signIn(login, newPassword);
      if (!authError && user) {
        setUser(user);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showChangePassword) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="lg:w-1/2 bg-[#FFA500] flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 text-white">
          <div className="max-w-md text-center">
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 lg:p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
              <img
                src="/amber-studios-logo.png"
                alt="Amber Studios Logo"
                className="w-48 sm:w-64 lg:w-80 h-auto mx-auto"
              />
            </div>
            <h1 className="text-18 sm:text-20 lg:text-24 font-bold mb-3 sm:mb-4">{t('login.workspace')}</h1>
            <p className="text-13 sm:text-14 lg:text-16 opacity-90">
              {t('login.managementSystemFor')}{' '}
              <a
                href="https://amber-studios.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors cursor-pointer underline"
              >
                amber-studios.com
              </a>
              <br />
              {t('login.gamePresenters')}
            </p>
          </div>
        </div>

        <div className="lg:w-1/2 bg-white flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <h2 className="text-20 sm:text-22 lg:text-24 font-bold text-gray-900 mb-2">{t('login.changePasswordRequired')}</h2>
            <p className="text-13 sm:text-14 text-gray-600 mb-6 sm:mb-8">{t('login.changePasswordSubtitle')}</p>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-13 sm:text-14">
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-13 sm:text-14 font-medium text-gray-700 mb-2">
                  {t('login.newPassword')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-13 sm:text-14 font-medium text-gray-700 mb-2">
                  {t('login.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent text-base"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {loading ? t('common.loading') : t('login.changePasswordButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-1/2 bg-[#FFA500] flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 text-white">
        <div className="max-w-md text-center">
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 lg:p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
            <img
              src="/amber-studios-logo.png"
              alt="Amber Studios Logo"
              className="w-48 sm:w-64 lg:w-80 h-auto mx-auto"
            />
          </div>
          <h1 className="text-18 sm:text-20 lg:text-24 font-bold mb-3 sm:mb-4">{t('login.workspace')}</h1>
          <p className="text-13 sm:text-14 lg:text-16 opacity-90">
            {t('login.managementSystemFor')}{' '}
            <a
              href="https://amber-studios.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors cursor-pointer underline"
            >
              amber-studios.com
            </a>
            <br />
            {t('login.gamePresenters')}
          </p>
        </div>
      </div>

      <div className="lg:w-1/2 bg-white flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-20 sm:text-22 lg:text-24 font-bold text-gray-900 mb-6 sm:mb-8">{t('login.title')}</h2>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-13 sm:text-14">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-13 sm:text-14 font-medium text-gray-700 mb-2">
                {t('login.loginPlaceholder')}
              </label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent text-base"
                required
              />
            </div>

            <div>
              <label className="block text-13 sm:text-14 font-medium text-gray-700 mb-2">
                {t('login.passwordPlaceholder')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent text-base"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? t('common.loading') : t('login.loginButton')}
            </button>

            <button
              type="button"
              className="w-full text-13 sm:text-14 text-gray-600 hover:text-amber transition-colors"
            >
              {t('login.forgotPassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
