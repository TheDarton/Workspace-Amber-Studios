import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/useAuth';
import { BookOpen } from 'lucide-react';
import { TrainingUserView } from '../components/training/TrainingUserView';
import { TrainingAdminBuilder } from '../components/training/TrainingAdminBuilder';

interface TrainingAcademyPageProps {
  countryId: string;
}

export function TrainingAcademyPage({ countryId }: TrainingAcademyPageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'global_admin';
  const isUser = user?.role === 'dealer' || user?.role === 'sm' || user?.role === 'operation';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BookOpen className="w-6 h-6 text-[#FFA500]" />
        <h1 className="text-24 font-bold text-gray-900">{t('nav.trainingAcademy')}</h1>
      </div>

      {isAdmin ? (
        <TrainingAdminBuilder countryId={countryId} />
      ) : isUser ? (
        <TrainingUserView countryId={countryId} userRole={user.role as 'dealer' | 'sm' | 'operation'} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Access denied</p>
          <p className="text-14 text-gray-400 mt-2">
            You don't have permission to view this content
          </p>
        </div>
      )}
    </div>
  );
}
