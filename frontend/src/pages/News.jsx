import { useEffect, useState } from 'react';
import client from '../api/client';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/news')
      .then((res) => setNews(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16 md:pt-20 pb-16 px-6 max-w-3xl mx-auto animate-fadeInUp">
      {!loading && news.length === 0 && (
        <p className="text-center text-rektelier-muted py-20">Belum ada berita.</p>
      )}
      <div className="divide-y divide-rektelier-divider">
        {news.map((item) => (
          <article key={item.id} className="py-10">
            {item.cover_image && (
              <img
                src={`${ASSET_BASE}${item.cover_image}`}
                alt={item.title}
                className="w-full h-64 object-cover mb-4"
              />
            )}
            <h2 className="text-lg font-bold uppercase mb-1">{item.title}</h2>
            {item.news_date && (
              <p className="text-xs text-rektelier-muted mb-3">
                {new Date(item.news_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            {item.content && (
              <p className="text-sm leading-relaxed whitespace-pre-line mb-3">{item.content}</p>
            )}
            {item.external_link && (
              <a href={item.external_link} target="_blank" rel="noreferrer" className="text-xs underline text-rektelier-muted break-all">
                {item.external_link}
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}