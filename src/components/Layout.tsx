import { ReactNode } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { Building2, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    setUser(null);
  };

  const displayName = user?.name && user?.surname
    ? `${user.name} ${user.surname}`
    : user?.role === 'global_admin'
      ? 'Global Admin'
      : user?.login || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
            <Building2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-amber flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-14 sm:text-15 lg:text-16 font-semibold text-gray-900 truncate">{displayName}</div>
              <div className="text-11 sm:text-12 text-gray-500 capitalize truncate">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 text-13 sm:text-14 text-gray-700 hover:text-amber hover:bg-amber-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
