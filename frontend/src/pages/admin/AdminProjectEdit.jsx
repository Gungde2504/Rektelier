import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');
const inputClass =
  'w-full border border-rektelier-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rektelier-black';

function isVideoUrl(url) {
  return /\.(mp4|webm)$/i.test(url || '');
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

function Dropzone({ file, existingUrl, onChange, accept, label, hint }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const objectUrl = useObjectUrl(file);
  const previewUrl = file ? objectUrl : existingUrl;
  const isVideo = file ? file.type.startsWith('video/') : isVideoUrl(existingUrl);

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
            {isVideo ? (
              <video src={previewUrl} muted className="w-full h-full object-cover" />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            )}
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

function GalleryItem({ file, onRemove }) {
  const url = useObjectUrl(file);
  const isVideo = file.type.startsWith('video/');

  return (
    <div className="relative w-24 h-24 border border-rektelier-border overflow-hidden rounded">
      {url && (isVideo ? (
        <video src={url} muted className="w-full h-full object-cover" />
      ) : (
        <img src={url} alt="Preview" className="w-full h-full object-cover" />
      ))}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs leading-none flex items-center justify-center hover:bg-black"
        aria-label="Hapus file"
      >
        ×
      </button>
    </div>
  );
}

function GalleryDropzone({ files, onChange, accept, label }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  function addFiles(fileList) {
    const newFiles = Array.from(fileList || []);
    if (newFiles.length === 0) return;
    onChange([...files, ...newFiles]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  function removeAt(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-xs uppercase text-rektelier-muted mb-1">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-md p-4 cursor-pointer transition-colors ${
          dragActive ? 'border-rektelier-black bg-gray-50' : 'border-rektelier-border'
        }`}
      >
        <p className="text-sm text-rektelier-muted text-center mb-3">
          Tarik &amp; lepas beberapa file di sini, atau klik untuk pilih
        </p>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <GalleryItem key={`${file.name}-${file.size}-${i}`} file={file} onRemove={() => removeAt(i)} />
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          className="hidden"
        />
      </div>
    </div>
  );
}

function ExistingGalleryItem({ image, removed, onToggle }) {
  const src = `${ASSET_BASE}${image.image_url}`;
  return (
    <div
      className={`relative w-24 h-24 border overflow-hidden rounded transition-opacity ${
        removed ? 'opacity-30 border-red-400' : 'border-rektelier-border'
      }`}
    >
      {image.media_type === 'video' ? (
        <video src={src} muted className="w-full h-full object-cover" />
      ) : (
        <img src={src} alt="Galeri" className="w-full h-full object-cover" />
      )}
      <button
        type="button"
        onClick={() => onToggle(image.id)}
        className={`absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs leading-none flex items-center justify-center ${
          removed ? 'bg-green-600 hover:bg-green-700' : 'bg-black/70 hover:bg-black'
        }`}
        aria-label={removed ? 'Batalkan hapus' : 'Hapus dari galeri'}
      >
        {removed ? '↺' : '×'}
      </button>
    </div>
  );
}

export default function AdminProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', category_id: '', location: '', year: '', description: '',
    size: '', client: '', build_status: '', video_url: '', sort_order: 0,
  });
  const [existingCover, setExistingCover] = useState(null);
  const [existingHeaderImage, setExistingHeaderImage] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [cover, setCover] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [newGallery, setNewGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    client.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
    client.get(`/admin/projects/${id}`).then((res) => {
      const project = res.data;
      setForm({
        title: project.title || '',
        category_id: project.category_id || '',
        location: project.location || '',
        year: project.year || '',
        description: project.description || '',
        size: project.size || '',
        client: project.client || '',
        build_status: project.build_status || '',
        video_url: project.video_url || '',
        sort_order: project.sort_order ?? 0,
      });
      setExistingCover(project.cover_image ? `${ASSET_BASE}${project.cover_image}` : null);
      setExistingHeaderImage(project.header_image ? `${ASSET_BASE}${project.header_image}` : null);
      setExistingGallery(project.images || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleRemoveImage(imageId) {
    setRemovedImageIds((prev) =>
      prev.includes(imageId) ? prev.filter((i) => i !== imageId) : [...prev, imageId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (cover) data.append('cover', cover);
    if (headerImage) data.append('header_image', headerImage);
    newGallery.forEach((file) => data.append('gallery', file));
    data.append('removed_image_ids', JSON.stringify(removedImageIds));
    try {
      await client.put(`/admin/projects/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/admin');
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
      <h1 className="text-xl font-bold uppercase mb-2">Edit Proyek</h1>
      <p className="text-sm text-rektelier-muted mb-6">Ubah data proyek lalu simpan.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} required placeholder="Judul Proyek" className={inputClass} />

        <select name="category_id" value={form.category_id} onChange={handleChange} className={inputClass}>
          <option value="">Pilih Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input name="location" value={form.location} onChange={handleChange} placeholder="Lokasi" className={inputClass} />
          <input name="year" value={form.year} onChange={handleChange} placeholder="Tahun" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input name="size" value={form.size} onChange={handleChange} placeholder="Ukuran (mis. 406 sqm)" className={inputClass} />
          <input name="client" value={form.client} onChange={handleChange} placeholder="Klien (mis. Confidential)" className={inputClass} />
        </div>

        <select name="build_status" value={form.build_status} onChange={handleChange} className={inputClass}>
          <option value="">Status Proyek</option>
          <option value="Completed">Completed</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Design Phase">Design Phase</option>
        </select>

        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi proyek" rows={4} className={inputClass} />

        <Dropzone
          file={cover}
          existingUrl={existingCover}
          onChange={setCover}
          accept="image/*,video/mp4,video/webm"
          label="Thumbnail (dipakai untuk kartu di grid home, boleh gambar atau video)"
        />

        <div className="border border-rektelier-border p-4">
          <label className="block text-xs uppercase text-rektelier-muted mb-2">Header Halaman Detail (tampil besar di atas halaman proyek)</label>
          <Dropzone
            file={headerImage}
            existingUrl={existingHeaderImage}
            onChange={setHeaderImage}
            accept="image/*"
            label="Upload Gambar Header"
          />
          <div className="mt-3">
            <label className="block text-xs uppercase text-rektelier-muted mb-1">Path Video Header (opsional, isi manual mis. /uploads/xxx.mp4)</label>
            <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="/uploads/xxx.mp4" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase text-rektelier-muted mb-1">Galeri Saat Ini</label>
          {existingGallery.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {existingGallery.map((img) => (
                <ExistingGalleryItem
                  key={img.id}
                  image={img}
                  removed={removedImageIds.includes(img.id)}
                  onToggle={toggleRemoveImage}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-rektelier-muted mb-3">Belum ada galeri.</p>
          )}
        </div>

        <GalleryDropzone
          files={newGallery}
          onChange={setNewGallery}
          accept="image/*,video/mp4,video/webm"
          label="Tambah Galeri Baru"
        />

        <input name="sort_order" type="number" value={form.sort_order} onChange={handleChange} placeholder="Urutan" className={inputClass} />

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
            onClick={() => navigate('/admin')}
            className="text-sm uppercase px-6 py-3 border border-rektelier-border"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}