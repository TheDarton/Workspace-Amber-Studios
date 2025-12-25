import { useTranslation } from '../hooks/useTranslation';
import { Newspaper } from 'lucide-react';

interface NewsPageProps {
  countryId: string;
}

export function NewsPage(_props: NewsPageProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Newspaper className="w-6 h-6 text-[#FFA500]" />
        <h1 className="text-24 font-bold text-gray-900">{t('nav.newsUpdates')}</h1>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">News & Updates feature requires a backend database</p>
        <p className="text-14 text-gray-400 mt-2">
          This feature is not available in static mode
        </p>
      </div>
    </div>
  );
}
