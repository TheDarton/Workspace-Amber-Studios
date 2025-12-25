import { useTranslation } from '../hooks/useTranslation';
import { BookOpen } from 'lucide-react';

interface TrainingAcademyPageProps {
  countryId: string;
}

export function TrainingAcademyPage(_props: TrainingAcademyPageProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BookOpen className="w-6 h-6 text-[#FFA500]" />
        <h1 className="text-24 font-bold text-gray-900">{t('nav.trainingAcademy')}</h1>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Training Academy feature requires a backend database</p>
        <p className="text-14 text-gray-400 mt-2">
          This feature is not available in static mode
        </p>
      </div>
    </div>
  );
}
