import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');
const inputClass =
  'w-full border border-rektelier-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rektelier-black';

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

function Dropzone({ file, existingUrl, onChange, accept, label, hint }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const objectUrl = useObjectUrl(file);
  const previewUrl = file ? objectUrl : existingUrl;

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
      <label className="block text-xs uppercase text-rektelier-muted mb-1">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-md h-40 flex items-center justify-center overflow-hidden transition-colors cursor-pointer ${
          dragActive ? 'border-rektelier-black bg-gray-50' : 'border-rektelier-border'
        }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            {file && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white text-sm leading-none flex items-center justify-center hover:bg-black"
                aria-label="Batalkan file baru"
              >
                ×
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="absolute bottom-2 right-2 text-xs bg-white/90 px-2 py-1 rounded hover:bg-white"
            >
              Ganti
            </button>
          </>
        ) : (
          <div className="text-center px-4">
            <p className="text-sm text-rektelier-muted">Tarik &amp; lepas file di sini, atau klik untuk pilih</p>
            {hint && <p className="text-xs text-rektelier-muted mt-1">{hint}</p>}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default function AdminNewsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', news_date: '', content: '', external_link: '',
  });
  const [existingCover, setExistingCover] = useState(null);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    client.get(`/admin/news/${id}`).then((res) => {
      const n = res.data;
      setForm({
        title: n.title || '',
        news_date: n.news_date ? new Date(n.news_date).toISOString().slice(0, 10) : '',
        content: n.content || '',
        external_link: n.external_link || '',
      });
      setExistingCover(n.cover_image ? `${ASSET_BASE}${n.cover_image}` : null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (cover) data.append('cover', cover);
    try {
      await client.put(`/admin/news/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/admin/news');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Terjadi kesalahan, coba lagi.');
    }
  }

  if (loading) {
    return <div className="pt-28 px-6 max-w-2xl mx-auto text-sm text-rektelier-muted">Memuat...</div>;
  }

  return (
    <div className="pt-28 pb-16 px-6 max-w-2xl mx-auto animate-fadeInUp">
      <h1 className="text-xl font-bold uppercase mb-2">Edit Berita</h1>
      <p className="text-sm text-rektelier-muted mb-6">Ubah data berita lalu simpan.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} required placeholder="Judul Berita" className={inputClass} />
        <input name="news_date" type="date" value={form.news_date} onChange={handleChange} className={inputClass} />
        <input name="external_link" value={form.external_link} onChange={handleChange} placeholder="Link sumber (opsional, mis. link Instagram/media)" className={inputClass} />
        <textarea name="content" value={form.content} onChange={handleChange} placeholder="Isi berita" rows={5} className={inputClass} />

        <Dropzone
          file={cover}
          existingUrl={existingCover}
          onChange={setCover}
          accept="image/*"
          label="Gambar (opsional)"
        />

        {status === 'error' && <p className="text-sm text-red-700">{message}</p>}

        <div className="flex gap-3">
          <button
            type="submit" disabled={status === 'loading'}
            className="bg-rektelier-black text-white uppercase tracking-wide text-sm px-6 py-3 transition-colors duration-300 hover:bg-rektelier-muted disabled:opacity-50"
          >
            {status === 'loading' ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            className="text-sm uppercase px-6 py-3 border border-rektelier-border"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}