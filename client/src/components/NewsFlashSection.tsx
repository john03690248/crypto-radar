import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Newspaper } from 'lucide-react';
import { api } from '../services/api';
import { NewsFlash } from '../types/crypto';

export function NewsFlashSection() {
  const [news, setNews] = useState<NewsFlash[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadNews = async () => {
    setIsLoading(true);
    const data = await api.getNews();
    if (data && data.length > 0) {
      setNews(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl p-4">
      
      {/* 區塊標題 */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-white">市場快訊與最新動態</h3>
        </div>

        <button
          onClick={loadNews}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2.5 py-1 rounded bg-dark-800 border border-slate-700 hover:border-slate-600 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? '更新中' : '重新整理'}</span>
        </button>
      </div>

      {/* 新聞列表 */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {isLoading && news.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-lg bg-dark-950/40 border border-slate-800/80 animate-pulse space-y-2">
              <div className="h-3 w-16 bg-slate-800 rounded"></div>
              <div className="h-4 w-full bg-slate-800 rounded"></div>
              <div className="h-8 w-full bg-slate-800/60 rounded"></div>
            </div>
          ))
        ) : news.length === 0 ? (
          <div className="col-span-3 py-6 text-center text-xs text-slate-500">
            目前暫無快訊
          </div>
        ) : (
          news.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg bg-dark-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-300">
                    {item.source}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 hover:text-cmc-blue transition-colors leading-snug">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                </h4>

                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
                  {item.category?.split('|')[0] || 'NEWS'}
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  <span>全文</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
