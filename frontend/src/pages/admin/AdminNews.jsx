import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.4 4.3M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.2-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [filter, setFilter] = useState('all');
  const { logout } = useAuth();

  function loadNews() {
    client.get('/admin/news').then((res) => setNews(res.data)).catch(() => {});
  }

  useEffect(() => { loadNews(); }, []);

  async function handlePublish(id) {
    await client.patch(`/admin/news/${id}/status`, { status: 'published' });
    loadNews();
  }

  async function handleUnpublish(id) {
    await client.patch(`/admin/news/${id}/status`, { status: 'draft' });
    loadNews();
  }

  async function handleDelete(id) {
    if (!confirm('Yakin hapus berita ini?')) return;
    await client.delete(`/admin/news/${id}`);
    loadNews();
  }

  const counts = {
    all: news.length,
    draft: news.filter((n) => n.status === 'draft').length,
    published: news.filter((n) => n.status === 'published').length,
  };
  const filtered = filter === 'all' ? news : news.filter((n) => n.status === filter);

  return (
    <div className="pt-24 px-6 max-w-6xl mx-auto pb-16">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-lg font-bold uppercase">Kelola News</h1>
        <div className="flex gap-5 items-center text-sm">
          <Link to="/admin" className="text-rektelier-muted hover:text-rektelier-black transition-colors">Proyek</Link>
          <Link to="/admin/categories" className="text-rektelier-muted hover:text-rektelier-black transition-colors">Kategori</Link>
          <Link to="/admin/team" className="text-rektelier-muted hover:text-rektelier-black transition-colors">Tim</Link>
          <Link to="/admin/about-images" className="text-rektelier-muted hover:text-rektelier-black transition-colors">Hero About</Link>
          <button onClick={logout} className="text-red-700 hover:text-red-900 transition-colors">Logout</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'draft', 'published'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs uppercase px-3 py-1.5 rounded-full border transition-colors ${
              filter === f ? 'bg-rektelier-black text-white border-rektelier-black' : 'border-rektelier-border text-rektelier-muted hover:text-rektelier-black'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'draft' ? 'Draft' : 'Published'} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((n) => (
          <div
            key={n.id}
            className="flex items-center gap-4 border border-rektelier-border rounded-lg p-3 hover:border-rektelier-black/30 transition-colors"
          >
            <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-md overflow-hidden">
              {n.cover_image && (
                <img src={`${ASSET_BASE}${n.cover_image}`} alt={n.title} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{n.title}</p>
              <p className="text-xs text-rektelier-muted">
                {n.news_date ? new Date(n.news_date).toLocaleDateString('id-ID') : 'Tanpa tanggal'} · {n.submitted_by_name || '-'}
              </p>
            </div>

            <span
              className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
                n.status === 'published' ? 'bg-[#D5EDD8] text-[#1A6B2A]' : 'bg-[#F5E8C0] text-[#8B6500]'
              }`}
            >
              {n.status}
            </span>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                to={`/admin/news/${n.id}/edit`}
                title="Edit"
                className="w-8 h-8 flex items-center justify-center rounded-md text-rektelier-muted hover:text-rektelier-black hover:bg-gray-100 transition-colors"
              >
                <PencilIcon />
              </Link>
              {n.status === 'draft' ? (
                <button
                  onClick={() => handlePublish(n.id)}
                  title="Publish"
                  className="w-8 h-8 flex items-center justify-center rounded-md text-rektelier-muted hover:text-rektelier-black hover:bg-gray-100 transition-colors"
                >
                  <EyeIcon />
                </button>
              ) : (
                <button
                  onClick={() => handleUnpublish(n.id)}
                  title="Unpublish"
                  className="w-8 h-8 flex items-center justify-center rounded-md text-rektelier-muted hover:text-rektelier-black hover:bg-gray-100 transition-colors"
                >
                  <EyeOffIcon />
                </button>
              )}
              <button
                onClick={() => handleDelete(n.id)}
                title="Hapus"
                className="w-8 h-8 flex items-center justify-center rounded-md text-red-700 hover:bg-red-50 transition-colors"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-sm text-rektelier-muted mt-8">Tidak ada berita.</p>}
    </div>
  );
}