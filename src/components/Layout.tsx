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
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Building2 className="w-8 h-8 text-amber" />
            <div>
              <div className="text-16 font-semibold text-gray-900">{displayName}</div>
              <div className="text-12 text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-14 text-gray-700 hover:text-amber hover:bg-amber-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
