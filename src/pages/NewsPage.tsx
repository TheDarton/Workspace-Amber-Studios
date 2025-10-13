import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';
import { Newspaper, Calendar as CalendarIcon } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: {
    blocks: Array<{
      type: 'text' | 'video' | 'image';
      content: string;
    }>;
  };
  created_at: string;
}

export function NewsPage({ countryId }: { countryId: string }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    loadNews();
  }, [countryId]);

  const loadNews = async () => {
    if (!countryId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('country_id', countryId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNews(data as NewsItem[]);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredNews = selectedMonth === 'all'
    ? news
    : news.filter(item => {
        const itemMonth = new Date(item.created_at).toISOString().slice(0, 7);
        return itemMonth === selectedMonth;
      });

  const availableMonths = Array.from(
    new Set(news.map(item => new Date(item.created_at).toISOString().slice(0, 7)))
  ).sort().reverse();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Newspaper className="w-6 h-6 text-amber" />
          <h1 className="text-24 font-bold text-gray-900">{t('nav.newsUpdates')}</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 border-4 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Newspaper className="w-6 h-6 text-amber" />
          <h1 className="text-24 font-bold text-gray-900">{t('nav.newsUpdates')}</h1>
        </div>

        {availableMonths.length > 0 && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-14 focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <option value="all">All Time</option>
            {availableMonths.map((month) => {
              const date = new Date(month + '-01');
              const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
              return (
                <option key={month} value={month}>
                  {label}
                </option>
              );
            })}
          </select>
        )}
      </div>

      {filteredNews.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No news available</p>
          <p className="text-14 text-gray-400 mt-2">
            {user?.role === 'admin' || user?.role === 'global_admin'
              ? 'Add news from the admin panel'
              : 'News will be posted by your administrator'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredNews.map((item) => (
            <article key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 text-14 text-gray-500 mb-3">
                  <CalendarIcon className="w-4 h-4" />
                  {formatDate(item.created_at)}
                </div>

                <h2 className="text-20 font-bold text-gray-900 mb-4">{item.title}</h2>

                <div className="space-y-4">
                  {item.content?.blocks?.map((block, idx) => (
                    <div key={idx}>
                      {block.type === 'text' && (
                        <p className="text-14 text-gray-700 whitespace-pre-wrap">{block.content}</p>
                      )}
                      {block.type === 'video' && (
                        <div className="aspect-video bg-gray-200 rounded">
                          <iframe
                            src={block.content}
                            className="w-full h-full rounded"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                      {block.type === 'image' && (
                        <img src={block.content} alt="" className="w-full rounded" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
