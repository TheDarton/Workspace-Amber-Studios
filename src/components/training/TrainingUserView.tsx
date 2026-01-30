import { useState, useEffect } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { fetchTrainingMaterials, TrainingMaterial } from '../../lib/trainingService';
import { CategoryCard } from './CategoryCard';

interface TrainingUserViewProps {
  countryId: string;
  userRole: 'dealer' | 'sm' | 'operation';
}

export function TrainingUserView({ countryId, userRole }: TrainingUserViewProps) {
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const materialType = userRole === 'sm' || userRole === 'operation' ? 'sm' : 'dealer';

  useEffect(() => {
    loadMaterials();
  }, [countryId, materialType]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTrainingMaterials(countryId, materialType);
      setMaterials(data);
    } catch (err) {
      setError('Failed to load training materials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <div>
          <p className="text-red-900 font-semibold">Error Loading Content</p>
          <p className="text-14 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No training materials available yet</p>
        <p className="text-14 text-gray-400 mt-2">
          Your administrator will add training content soon
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {materials.map((material) => (
        <div key={material.id} className="space-y-4">
          {material.content?.categories?.map((category) => (
            <CategoryCard key={category.id} category={category} defaultCollapsed={true} />
          ))}
        </div>
      ))}
    </div>
  );
}
