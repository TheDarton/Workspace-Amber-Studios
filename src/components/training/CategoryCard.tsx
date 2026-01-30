import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '../../lib/trainingService';
import { ContentBlockDisplay } from './ContentBlockDisplay';

interface CategoryCardProps {
  category: Category;
  defaultCollapsed?: boolean;
}

export function CategoryCard({ category, defaultCollapsed = true }: CategoryCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
          <h3 className="text-16 font-semibold text-gray-900">{category.name}</h3>
          <span className="text-13 text-gray-500">
            ({category.blocks.length} {category.blocks.length === 1 ? 'item' : 'items'})
          </span>
        </div>
      </button>

      {!isCollapsed && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {category.blocks.length === 0 ? (
            <p className="text-14 text-gray-500 text-center py-4">No content available</p>
          ) : (
            category.blocks.map((block) => (
              <ContentBlockDisplay key={block.id} block={block} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
