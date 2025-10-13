import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { GlobalAdminPage } from './pages/GlobalAdminPage';
import { AdminPage } from './pages/AdminPage';
import { UserPage } from './pages/UserPage';

function AppContent() {
  const { user, isLoading, language } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === 'global_admin') {
    return <GlobalAdminPage />;
  }

  if (user.role === 'admin') {
    return <AdminPage />;
  }

  return <UserPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
