import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');
const MAX_IMAGES = 5;

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

function PendingThumb({ file, onRemove }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden border border-dashed border-rektelier-black/40">
      {url && <img src={url} alt="Preview" className="w-full h-full object-cover" />}
      <span className="absolute bottom-1 left-1 text-[10px] uppercase bg-black/70 text-white px-1.5 py-0.5 rounded">
        Baru
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Batalkan"
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white text-sm leading-none flex items-center justify-center hover:bg-black"
      >
        ×
      </button>
    </div>
  );
}

export default function AdminAboutImages() {
  const [images, setImages] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const slotsLeft = MAX_IMAGES - images.length - pending.length;

  function load() {
    return client
      .get('/about-images')
      .then((res) => setImages(res.data))
      .catch(() => setError('Gagal memuat gambar'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function addFiles(fileList) {
    setError('');
    const incoming = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (incoming.length === 0) return;
    const room = MAX_IMAGES - images.length - pending.length;
    if (room <= 0) {
      setError(`Maksimal ${MAX_IMAGES} gambar. Hapus salah satu dulu untuk menambah.`);
      return;
    }
    if (incoming.length > room) {
      setError(`Hanya ${room} slot tersisa, ${incoming.length - room} gambar diabaikan.`);
    }
    setPending((prev) => [...prev, ...incoming.slice(0, room)]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleUpload() {
    if (pending.length === 0) return;
    setUploading(true);
    setError('');
    const data = new FormData();
    pending.forEach((f) => data.append('images', f));
    try {
      await client.post('/about-images', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPending([]);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengupload gambar');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus gambar ini?')) return;
    setError('');
    try {
      await client.delete(`/about-images/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menghapus gambar');
    }
  }

  return (
    <div className="pt-24 px-6 max-w-3xl mx-auto pb-16">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs uppercase text-rektelier-muted hover:text-rektelier-black transition-colors mb-6"
      >
        <ArrowLeftIcon />
        Kembali ke Dashboard
      </Link>

      <h1 className="text-lg font-bold uppercase mb-1">Gambar Hero About</h1>
      <p className="text-sm text-rektelier-muted mb-6">
        Maksimal {MAX_IMAGES} gambar, boleh kurang. Gambar tampil bergantian di halaman About sesuai urutan upload.
        Kalau belum ada gambar, halaman About memakai gambar bawaan.
      </p>

      {error && (
        <p className="text-sm text-red-700 border border-red-200 bg-red-50 px-4 py-2 mb-4">{error}</p>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase text-rektelier-muted">
          Gambar saat ini ({images.length}/{MAX_IMAGES})
        </h2>
      </div>

      {!loading && images.length === 0 && pending.length === 0 && (
        <p className="text-sm text-rektelier-muted border border-rektelier-border rounded-md px-4 py-6 mb-4 text-center">
          Belum ada gambar. Halaman About memakai gambar bawaan.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {images.map((img, i) => (
          <div key={img.id} className="relative aspect-video bg-gray-100 rounded-md overflow-hidden border border-rektelier-border">
            <img src={`${ASSET_BASE}${img.image_url}`} alt={`Hero ${i + 1}`} className="w-full h-full object-cover" />
            <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
              {i + 1}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(img.id)}
              title="Hapus"
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-md bg-white/90 text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        {pending.map((file, i) => (
          <PendingThumb
            key={`${file.name}-${i}`}
            file={file}
            onRemove={() => setPending((prev) => prev.filter((_, idx) => idx !== i))}
          />
        ))}
      </div>

      {slotsLeft > 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-md h-28 flex items-center justify-center cursor-pointer transition-colors mb-4 ${
            dragActive ? 'border-rektelier-black bg-gray-50' : 'border-rektelier-border'
          }`}
        >
          <p className="text-sm text-rektelier-muted text-center px-4">
            Tarik &amp; lepas gambar di sini, atau klik untuk pilih ({slotsLeft} slot tersisa)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            className="hidden"
          />
        </div>
      ) : (
        <p className="text-xs text-rektelier-muted mb-4">Slot penuh. Hapus satu gambar untuk menambah yang baru.</p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading || pending.length === 0}
        className="bg-rektelier-black text-white uppercase tracking-wide text-sm px-6 py-2.5 transition-colors duration-300 hover:bg-rektelier-muted disabled:opacity-50"
      >
        {uploading ? 'Mengupload...' : `Upload${pending.length ? ` (${pending.length})` : ''}`}
      </button>
    </div>
  );
}
