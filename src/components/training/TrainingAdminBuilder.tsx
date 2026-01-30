import { useState, useEffect } from 'react';
import { Plus, FolderPlus, Video, FileText, Edit2, Trash2, ChevronDown, ChevronRight, Save, AlertCircle } from 'lucide-react';
import {
  fetchTrainingMaterials,
  updateTrainingMaterialContent,
  createTrainingMaterial,
  TrainingMaterial,
  Category,
  ContentBlock,
  generateCategoryId,
} from '../../lib/trainingService';
import { BlockEditorModal } from './BlockEditorModal';
import { CategoryModal } from './CategoryModal';

interface TrainingAdminBuilderProps {
  countryId: string;
}

export function TrainingAdminBuilder({ countryId }: TrainingAdminBuilderProps) {
  const [activeTab, setActiveTab] = useState<'dealer' | 'sm'>('dealer');
  const [materials, setMaterials] = useState<TrainingMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);

  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockModalType, setBlockModalType] = useState<'video' | 'text' | 'video-text'>('video');
  const [editingBlock, setEditingBlock] = useState<{ categoryId: string; block: ContentBlock | null }>({ categoryId: '', block: null });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMaterials();
  }, [countryId, activeTab]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTrainingMaterials(countryId, activeTab);

      if (data.length === 0) {
        const newMaterial = await createTrainingMaterial(countryId, activeTab, `${activeTab === 'dealer' ? 'Dealer' : 'Shift Manager'} Training`);
        setMaterials(newMaterial);
      } else {
        setMaterials(data[0]);
      }

      setHasChanges(false);
    } catch (err) {
      setError('Failed to load training materials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!materials) return;

    try {
      setSaving(true);
      setError(null);
      await updateTrainingMaterialContent(materials.id, materials.content);
      setHasChanges(false);
      setSuccessMessage('Changes saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addCategory = (name: string) => {
    if (!materials) return;

    const newCategory: Category = {
      id: generateCategoryId(),
      name,
      collapsed: false,
      blocks: [],
    };

    const updatedContent = {
      ...materials.content,
      categories: [...(materials.content?.categories || []), newCategory],
    };

    setMaterials({ ...materials, content: updatedContent });
    setHasChanges(true);
    setExpandedCategories(new Set([...expandedCategories, newCategory.id]));
  };

  const renameCategory = (categoryId: string, newName: string) => {
    if (!materials) return;

    const updatedCategories = materials.content.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, name: newName } : cat
    );

    setMaterials({
      ...materials,
      content: { ...materials.content, categories: updatedCategories },
    });
    setHasChanges(true);
  };

  const deleteCategory = (categoryId: string) => {
    if (!materials) return;
    if (!confirm('Are you sure you want to delete this category and all its content?')) return;

    const updatedCategories = materials.content.categories.filter((cat) => cat.id !== categoryId);

    setMaterials({
      ...materials,
      content: { ...materials.content, categories: updatedCategories },
    });
    setHasChanges(true);
  };

  const addBlock = (categoryId: string, block: ContentBlock) => {
    if (!materials) return;

    const updatedCategories = materials.content.categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, blocks: [...cat.blocks, block] }
        : cat
    );

    setMaterials({
      ...materials,
      content: { ...materials.content, categories: updatedCategories },
    });
    setHasChanges(true);
  };

  const updateBlock = (categoryId: string, block: ContentBlock) => {
    if (!materials) return;

    const updatedCategories = materials.content.categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, blocks: cat.blocks.map((b) => (b.id === block.id ? block : b)) }
        : cat
    );

    setMaterials({
      ...materials,
      content: { ...materials.content, categories: updatedCategories },
    });
    setHasChanges(true);
  };

  const deleteBlock = (categoryId: string, blockId: string) => {
    if (!materials) return;
    if (!confirm('Are you sure you want to delete this block?')) return;

    const updatedCategories = materials.content.categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, blocks: cat.blocks.filter((b) => b.id !== blockId) }
        : cat
    );

    setMaterials({
      ...materials,
      content: { ...materials.content, categories: updatedCategories },
    });
    setHasChanges(true);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getBlockIcon = (type: string) => {
    if (type === 'video') return <Video className="w-4 h-4 text-[#FFA500]" />;
    if (type === 'text') return <FileText className="w-4 h-4 text-[#FFA500]" />;
    return <Video className="w-4 h-4 text-[#FFA500]" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dealer')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === 'dealer'
                ? 'bg-[#FFA500] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dealer Materials
          </button>
          <button
            onClick={() => setActiveTab('sm')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              activeTab === 'sm'
                ? 'bg-[#FFA500] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Shift Manager Materials
          </button>
        </div>

        {hasChanges && (
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-14">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-14">{successMessage}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FFA500] hover:bg-[#FF8C00] text-white rounded-lg font-medium transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="space-y-4">
        {materials?.content?.categories?.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <FolderPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No categories yet</p>
            <p className="text-14 text-gray-400 mt-2">
              Click "Add Category" to create your first category
            </p>
          </div>
        ) : (
          materials?.content?.categories?.map((category) => (
            <div key={category.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <h3 className="text-16 font-semibold text-gray-900">{category.name}</h3>
                  <span className="text-13 text-gray-500">
                    ({category.blocks.length} {category.blocks.length === 1 ? 'block' : 'blocks'})
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory({ id: category.id, name: category.name });
                      setCategoryModalOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:text-[#FFA500] hover:bg-amber-50 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expandedCategories.has(category.id) && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setBlockModalType('video');
                        setEditingBlock({ categoryId: category.id, block: null });
                        setBlockModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-13 font-medium transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Add Video
                    </button>
                    <button
                      onClick={() => {
                        setBlockModalType('video-text');
                        setEditingBlock({ categoryId: category.id, block: null });
                        setBlockModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-13 font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Video + Text
                    </button>
                    <button
                      onClick={() => {
                        setBlockModalType('text');
                        setEditingBlock({ categoryId: category.id, block: null });
                        setBlockModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-13 font-medium transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Add Text
                    </button>
                  </div>

                  {category.blocks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-14">
                      No blocks yet. Add content using the buttons above.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {category.blocks.map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            {getBlockIcon(block.type)}
                            <div>
                              <p className="text-14 font-medium text-gray-900">{block.title}</p>
                              <p className="text-12 text-gray-500 capitalize">{block.type.replace('-', ' + ')}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setBlockModalType(block.type);
                                setEditingBlock({ categoryId: category.id, block });
                                setBlockModalOpen(true);
                              }}
                              className="p-2 text-gray-600 hover:text-[#FFA500] hover:bg-amber-50 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteBlock(category.id, block.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={(name) => {
          if (editingCategory) {
            renameCategory(editingCategory.id, name);
          } else {
            addCategory(name);
          }
        }}
        existingName={editingCategory?.name}
      />

      <BlockEditorModal
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setEditingBlock({ categoryId: '', block: null });
        }}
        onSave={(block) => {
          if (editingBlock.block) {
            updateBlock(editingBlock.categoryId, block);
          } else {
            addBlock(editingBlock.categoryId, block);
          }
        }}
        blockType={blockModalType}
        existingBlock={editingBlock.block || undefined}
      />
    </div>
  );
}
