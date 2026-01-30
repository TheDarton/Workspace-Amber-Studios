import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { LoginPage } from './pages/LoginPage';
import { GlobalAdminPage } from './pages/GlobalAdminPage';
import { AdminPage } from './pages/AdminPage';
import { OperationPage } from './pages/OperationPage';
import { UserPage } from './pages/UserPage';

function AppContent() {
  const { user, isLoading } = useAuth();

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

  if (user.role === 'operation') {
    return <OperationPage />;
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
