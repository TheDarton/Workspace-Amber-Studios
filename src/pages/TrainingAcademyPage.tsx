import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';
import { BookOpen, ChevronDown, ChevronUp, MessageCircle, Send } from 'lucide-react';

interface TrainingMaterial {
  id: string;
  title: string;
  type: 'dealer' | 'sm';
  content: {
    blocks: Array<{
      id: string;
      title: string;
      layout: '1col' | '2col' | '3col';
      items: Array<{
        type: 'text' | 'video' | 'image';
        content: string;
      }>;
    }>;
  };
  order_index: number;
}

interface Question {
  id: string;
  material_id: string;
  user_id: string;
  question_text: string;
  answer_text: string | null;
  created_at: string;
}

export function TrainingAcademyPage({ countryId }: { countryId: string }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [countryId, user]);

  const loadMaterials = async () => {
    if (!countryId) return;

    setLoading(true);
    const materialType = user?.role === 'sm' ? 'sm' : 'dealer';

    const { data, error } = await supabase
      .from('training_materials')
      .select('*')
      .eq('country_id', countryId)
      .eq('type', materialType)
      .order('order_index');

    if (!error && data) {
      setMaterials(data as TrainingMaterial[]);
    }
    setLoading(false);
  };

  const loadQuestions = async (materialId: string) => {
    const { data, error } = await supabase
      .from('training_questions')
      .select('*')
      .eq('material_id', materialId)
      .eq('user_id', user?.id || '')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuestions(data as Question[]);
    }
  };

  const toggleBlock = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  const handleAskQuestion = async (materialId: string) => {
    if (!question.trim()) return;

    const { error } = await supabase
      .from('training_questions')
      .insert({
        material_id: materialId,
        user_id: user?.id,
        question_text: question,
      });

    if (!error) {
      setQuestion('');
      loadQuestions(materialId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BookOpen className="w-6 h-6 text-amber" />
          <h1 className="text-24 font-bold text-gray-900">{t('nav.trainingAcademy')}</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 border-4 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading training materials...</p>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BookOpen className="w-6 h-6 text-amber" />
          <h1 className="text-24 font-bold text-gray-900">{t('nav.trainingAcademy')}</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No training materials available yet</p>
          <p className="text-14 text-gray-400 mt-2">
            {user?.role === 'admin' || user?.role === 'global_admin'
              ? 'Add training materials from the admin panel'
              : 'Training materials will be added by your administrator'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BookOpen className="w-6 h-6 text-amber" />
        <h1 className="text-24 font-bold text-gray-900">
          {user?.role === 'sm' ? 'SM Training Academy' : 'Dealer Training Academy'}
        </h1>
      </div>

      <div className="space-y-4">
        {materials.map((material) => (
          <div key={material.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-20 font-bold text-gray-900">{material.title}</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {material.content?.blocks?.map((block) => (
                <div key={block.id}>
                  <button
                    onClick={() => toggleBlock(block.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-16 font-semibold text-gray-900">{block.title}</span>
                    {expandedBlocks.has(block.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {expandedBlocks.has(block.id) && (
                    <div className="px-6 py-4 bg-gray-50">
                      <div
                        className={`grid gap-4 ${
                          block.layout === '1col'
                            ? 'grid-cols-1'
                            : block.layout === '2col'
                            ? 'grid-cols-2'
                            : 'grid-cols-3'
                        }`}
                      >
                        {block.items?.map((item, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                            {item.type === 'text' && (
                              <p className="text-14 text-gray-700 whitespace-pre-wrap">{item.content}</p>
                            )}
                            {item.type === 'video' && (
                              <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                                <iframe
                                  src={item.content}
                                  className="w-full h-full rounded"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            )}
                            {item.type === 'image' && (
                              <img src={item.content} alt="" className="w-full rounded" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-amber mt-3" />
                <div className="flex-1">
                  <label className="block text-14 font-medium text-gray-700 mb-2">
                    Ask a Question
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedMaterial === material.id ? question : ''}
                      onChange={(e) => {
                        setSelectedMaterial(material.id);
                        setQuestion(e.target.value);
                      }}
                      placeholder="Type your question here..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
                    />
                    <button
                      onClick={() => handleAskQuestion(material.id)}
                      disabled={!question.trim()}
                      className="px-4 py-2 bg-amber hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {selectedMaterial === material.id && questions.length > 0 && (
                <div className="mt-4 space-y-3">
                  {questions.map((q) => (
                    <div key={q.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-14 font-medium text-gray-900 mb-2">{q.question_text}</p>
                      {q.answer_text ? (
                        <div className="pl-4 border-l-2 border-amber">
                          <p className="text-14 text-gray-700">{q.answer_text}</p>
                        </div>
                      ) : (
                        <p className="text-12 text-gray-500 italic">Waiting for admin response...</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
