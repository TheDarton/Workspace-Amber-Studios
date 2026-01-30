import { useState, useEffect } from 'react';
import { X, FolderPlus, AlertCircle } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  existingName?: string;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  existingName,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingName) {
      setName(existingName);
    } else {
      setName('');
    }
    setError(null);
  }, [existingName, isOpen]);

  const handleSave = () => {
    setError(null);

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    onSave(name.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-18 font-bold text-gray-900">
            {existingName ? 'Rename Category' : 'Add Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-13">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-14 font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Getting Started, Advanced Topics"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#FFA500] hover:bg-[#FF8C00] text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            {existingName ? 'Update' : 'Add'} Category
          </button>
        </div>
      </div>
    </div>
  );
}
