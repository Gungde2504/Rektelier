import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');
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

function useObjectUrl(file) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
}

function PhotoDropzone({ file, onChange }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const url = useObjectUrl(file);

  function handleFiles(fileList) {
    if (fileList && fileList[0]) onChange(fileList[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <label className="block text-xs uppercase text-rektelier-muted mb-1">Foto (opsional)</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-md h-32 flex items-center justify-center overflow-hidden transition-colors cursor-pointer ${
          dragActive ? 'border-rektelier-black bg-gray-50' : 'border-rektelier-border'
        }`}
      >
        {url ? (
          <>
            <img src={url} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white text-sm leading-none flex items-center justify-center hover:bg-black"
              aria-label="Hapus file"
            >
              ×
            </button>
          </>
        ) : (
          <p className="text-sm text-rektelier-muted text-center px-4">Tarik &amp; lepas foto di sini, atau klik untuk pilih</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default function AdminTeam() {
  const [team, setTeam] = useState([]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  function load() {
    client.get('/team').then((res) => setTeam(res.data));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const data = new FormData();
    data.append('name', name);
    data.append('position', position);
    if (photo) data.append('photo', photo);
    try {
      await client.post('/team', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setName('');
      setPosition('');
      setPhoto(null);
      load();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus anggota tim ini?')) return;
    await client.delete(`/team/${id}`);
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

      <h1 className="text-lg font-bold uppercase mb-6">Kelola Tim</h1>

      <form onSubmit={handleAdd} className="space-y-3 mb-8 border border-rektelier-border p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" className={inputClass} />
        <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Posisi/Jabatan" className={inputClass} />
        <PhotoDropzone file={photo} onChange={setPhoto} />
        <button
          type="submit"
          disabled={loading}
          className="bg-rektelier-black text-white uppercase tracking-wide text-sm px-6 py-2.5 transition-colors duration-300 hover:bg-rektelier-muted disabled:opacity-50"
        >
          {loading ? 'Menambah...' : 'Tambah Anggota'}
        </button>
      </form>

      <div className="space-y-2">
        {team.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-4 border border-rektelier-border rounded-lg p-3 hover:border-rektelier-black/30 transition-colors"
          >
            <div className="w-12 h-12 shrink-0 bg-gray-100 rounded-full overflow-hidden">
              {t.photo_url && (
                <img src={`${ASSET_BASE}${t.photo_url}`} alt={t.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.name}</p>
              <p className="text-xs text-rektelier-muted truncate">{t.position || '-'}</p>
            </div>
            <button
              onClick={() => handleDelete(t.id)}
              title="Hapus"
              className="w-8 h-8 flex items-center justify-center rounded-md text-red-700 hover:bg-red-50 transition-colors shrink-0"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {team.length === 0 && <p className="text-sm text-rektelier-muted mt-8">Belum ada anggota tim.</p>}
    </div>
  );
}