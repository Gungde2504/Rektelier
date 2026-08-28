import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    client.get(`/projects/${slug}`)
      .then((res) => setProject(res.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="pt-32 text-center">
        <p>Proyek tidak ditemukan.</p>
        <Link to="/" className="underline">Kembali ke home</Link>
      </div>
    );
  }

  if (!project) return <div className="pt-32 text-center text-rektelier-muted">Memuat...</div>;

  const media = project.images || [];

  const metaRows = [
    { label: 'PROJECT', value: project.title },
    { label: 'TYPE', value: project.category_name },
    { label: 'SIZE', value: project.size },
    { label: 'CLIENT', value: project.client },
    { label: 'LOCATION', value: project.location },
    { label: 'STATUS', value: project.build_status },
  ].filter((row) => row.value);

  return (
    <div className="animate-fadeInUp">
      {project.video_url ? (
        <video
          src={`${ASSET_BASE}${project.video_url}`}
          autoPlay muted loop playsInline
          className="w-full h-[60vh] md:h-screen object-cover"
        />
      ) : project.header_image ? (
        <img
          src={`${ASSET_BASE}${project.header_image}`}
          alt={project.title}
          className="w-full h-[60vh] md:h-screen object-cover"
        />
      ) : null}

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-xl md:text-2xl font-bold uppercase mb-6">{project.title}</h1>

        <div className="mb-8 space-y-1">
          {metaRows.map((row) => (
            <div key={row.label} className="flex text-sm">
              <span className="w-32 shrink-0 text-rektelier-black">{row.label}</span>
              <span className="w-6 shrink-0">:</span>
              <span className="text-rektelier-muted">{row.value}</span>
            </div>
          ))}
        </div>

        {project.description && (
          <p className="text-sm leading-relaxed whitespace-pre-line mb-10">{project.description}</p>
        )}

        {media.length > 0 && (
          <div className="space-y-1">
            {media.map((item) =>
              item.media_type === 'video' ? (
                <video
                  key={item.id}
                  src={`${ASSET_BASE}${item.image_url}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full h-auto block"
                />
              ) : (
                <img
                  key={item.id}
                  src={`${ASSET_BASE}${item.image_url}`}
                  alt={project.title}
                  className="w-full h-auto block"
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}