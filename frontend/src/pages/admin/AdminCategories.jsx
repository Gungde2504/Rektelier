import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

const inputClass =
  'w-full border border-rektelier-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rektelier-black';

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
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

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  function load() {
    client.get('/categories').then((res) => setCategories(res.data));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await client.post('/categories', { name });
      setName('');
      load();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus kategori ini?')) return;
    await client.delete(`/categories/${id}`);
    load();
  }

  return (
    <div className="pt-24 px-6 max-w-2xl mx-auto pb-16">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs uppercase text-rektelier-muted hover:text-rektelier-black transition-colors mb-6"
      >
        <ArrowLeftIcon />
        Kembali ke Dashboard
      </Link>

      <h1 className="text-lg font-bold uppercase mb-6">Kelola Kategori</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kategori baru"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-rektelier-black text-white uppercase tracking-wide text-sm px-6 py-2 transition-colors duration-300 hover:bg-rektelier-muted disabled:opacity-50 shrink-0"
        >
          {loading ? 'Menambah...' : 'Tambah'}
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex justify-between items-center border border-rektelier-border rounded-lg px-4 py-3 hover:border-rektelier-black/30 transition-colors"
          >
            <span className="text-sm">{c.name}</span>
            <button
              onClick={() => handleDelete(c.id)}
              title="Hapus"
              className="w-8 h-8 flex items-center justify-center rounded-md text-red-700 hover:bg-red-50 transition-colors"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && <p className="text-sm text-rektelier-muted mt-8">Belum ada kategori.</p>}
    </div>
  );
}