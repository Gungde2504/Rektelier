import { useEffect, useRef, useState } from 'react';
import client from '../api/client';

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

function Dropzone({ file, onChange, accept, label, hint }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const url = useObjectUrl(file);
  const isVideo = file && file.type.startsWith('video/');

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
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-md h-40 flex items-center justify-center overflow-hidden transition-colors ${
          dragActive ? 'border-rektelier-black bg-gray-50' : 'border-rektelier-border'
        } ${file ? '' : 'cursor-pointer'}`}
      >
        {file && url ? (
          <>
            {isVideo ? (
              <video src={url} muted className="w-full h-full object-cover" />
            ) : (
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
            )}
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
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="absolute bottom-2 right-2 text-xs bg-white/90 px-2 py-1 rounded hover:bg-white"
            >
              Ganti
            </button>
          </>
        ) : (
          <div className="text-center px-4 cursor-pointer">
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

function ProjectForm() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', category_id: '', location: '', year: '', description: '',
    size: '', client: '', build_status: '',
    submitted_by_name: '', submitted_by_email: '',
  });
  const [headerType, setHeaderType] = useState('image');
  const [thumbnail, setThumbnail] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [headerVideo, setHeaderVideo] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    client.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (thumbnail) data.append('cover', thumbnail);
    if (headerType === 'image' && headerImage) data.append('header_image', headerImage);
    if (headerType === 'video' && headerVideo) data.append('header_video', headerVideo);
    gallery.forEach((file) => data.append('gallery', file));
    try {
      await client.post('/projects/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      setMessage('Proyek berhasil dikirim dan akan direview sebelum tayang. Terima kasih!');
      setForm({
        title: '', category_id: '', location: '', year: '', description: '',
        size: '', client: '', build_status: '',
        submitted_by_name: '', submitted_by_email: '',
      });
      setHeaderType('image');
      setThumbnail(null);
      setHeaderImage(null);
      setHeaderVideo(null);
      setGallery([]);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Terjadi kesalahan, coba lagi.');
    }
  }

  if (status === 'success') {
    return <div className="border border-rektelier-black p-6 text-sm">{message}</div>;
  }

  return (
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
        file={thumbnail}
        onChange={setThumbnail}
        accept="image/*,video/mp4,video/webm"
        label="Thumbnail (wajib — dipakai untuk kartu di grid home, boleh gambar atau video)"
      />

      <div className="border border-rektelier-border p-4">
        <label className="block text-xs uppercase text-rektelier-muted mb-2">Header Halaman Detail (tampil besar di atas halaman proyek)</label>
        <div className="flex gap-4 mb-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="headerType" value="image" checked={headerType === 'image'} onChange={() => setHeaderType('image')} />
            Gambar
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="headerType" value="video" checked={headerType === 'video'} onChange={() => setHeaderType('video')} />
            Video
          </label>
        </div>
        {headerType === 'image' ? (
          <Dropzone file={headerImage} onChange={setHeaderImage} accept="image/*" label="Upload Gambar Header" />
        ) : (
          <Dropzone
            file={headerVideo}
            onChange={setHeaderVideo}
            accept="video/mp4,video/webm"
            label="Upload Video Header"
            hint="mp4/webm, maks 50MB"
          />
        )}
      </div>

      <GalleryDropzone
        files={gallery}
        onChange={setGallery}
        accept="image/*,video/mp4,video/webm"
        label="Galeri (ditampilkan berurutan di bawah deskripsi — bisa campur gambar & video)"
      />

      <div className="grid grid-cols-2 gap-4">
        <input name="submitted_by_name" value={form.submitted_by_name} onChange={handleChange} required placeholder="Nama Kamu" className={inputClass} />
        <input name="submitted_by_email" type="email" value={form.submitted_by_email} onChange={handleChange} required placeholder="Email Kamu" className={inputClass} />
      </div>
      {status === 'error' && <p className="text-sm text-red-700">{message}</p>}
      <button
        type="submit" disabled={status === 'loading'}
        className="bg-rektelier-black text-white uppercase tracking-wide text-sm px-6 py-3 transition-colors duration-300 hover:bg-rektelier-muted disabled:opacity-50"
      >
        {status === 'loading' ? 'Mengirim...' : 'Kirim Proyek'}
      </button>
    </form>
  );
}

function NewsForm() {
  const [form, setForm] = useState({
    title: '', news_date: '', content: '', external_link: '',
    submitted_by_name: '', submitted_by_email: '',
  });
  const [cover, setCover] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (cover) data.append('cover', cover);
    try {
      await client.post('/news/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      setMessage('Berita berhasil dikirim dan akan direview sebelum tayang. Terima kasih!');
      setForm({ title: '', news_date: '', content: '', external_link: '', submitted_by_name: '', submitted_by_email: '' });
      setCover(null);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Terjadi kesalahan, coba lagi.');
    }
  }

  if (status === 'success') {
    return <div className="border border-rektelier-black p-6 text-sm">{message}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="title" value={form.title} onChange={handleChange} required placeholder="Judul Berita" className={inputClass} />
      <input name="news_date" type="date" value={form.news_date} onChange={handleChange} className={inputClass} />
      <input name="external_link" value={form.external_link} onChange={handleChange} placeholder="Link sumber (opsional, mis. link Instagram/media)" className={inputClass} />
      <textarea name="content" value={form.content} onChange={handleChange} placeholder="Isi berita" rows={5} className={inputClass} />

      <Dropzone file={cover} onChange={setCover} accept="image/*" label="Gambar (opsional)" />

      <div className="grid grid-cols-2 gap-4">
        <input name="submitted_by_name" value={form.submitted_by_name} onChange={handleChange} required placeholder="Nama Kamu" className={inputClass} />
        <input name="submitted_by_email" type="email" value={form.submitted_by_email} onChange={handleChange} required placeholder="Email Kamu" className={inputClass} />
      </div>
      {status === 'error' && <p className="text-sm text-red-700">{message}</p>}
      <button
        type="submit" disabled={status === 'loading'}
        className="bg-rektelier-black text-white uppercase tracking-wide text-sm px-6 py-3 transition-colors duration-300 hover:bg-rektelier-muted disabled:opacity-50"
      >
        {status === 'loading' ? 'Mengirim...' : 'Kirim Berita'}
      </button>
    </form>
  );
}

export default function SubmitProject() {
  const [type, setType] = useState('project');

  return (
    <div className="pt-28 pb-16 px-6 max-w-2xl mx-auto animate-fadeInUp">
      <h1 className="text-xl font-bold uppercase mb-2">Submit Konten</h1>
      <p className="text-sm text-rektelier-muted mb-6">
        Kirim proyek atau berita untuk ditampilkan di Rektelier. Konten akan direview admin sebelum tayang.
      </p>

      <div className="flex gap-2 mb-8">
        <button
          type="button"
          onClick={() => setType('project')}
          className={`text-xs uppercase px-4 py-2 border ${type === 'project' ? 'bg-rektelier-black text-white' : 'border-rektelier-border'}`}
        >
          Proyek
        </button>
        <button
          type="button"
          onClick={() => setType('news')}
          className={`text-xs uppercase px-4 py-2 border ${type === 'news' ? 'bg-rektelier-black text-white' : 'border-rektelier-border'}`}
        >
          News
        </button>
      </div>

      {type === 'project' ? <ProjectForm /> : <NewsForm />}
    </div>
  );
}