import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import Seo from '../components/Seo';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

function isVideoUrl(url) {
  return /\.(mp4|webm)$/i.test(url || '');
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setProject(null);
    setNotFound(false);
    client.get(`/projects/${slug}`)
      .then((res) => setProject(res.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="pt-32 text-center">
        <Seo title="Proyek tidak ditemukan" noindex />
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

  const shareImagePath =
    project.header_image ||
    (project.cover_image && !isVideoUrl(project.cover_image) ? project.cover_image : null) ||
    media.find((m) => m.media_type !== 'video')?.image_url ||
    null;
  const shareImage = shareImagePath ? `${ASSET_BASE}${shareImagePath}` : '';

  const seoDescription =
    (project.description || '').replace(/\s+/g, ' ').trim().slice(0, 155) ||
    [project.category_name, project.location].filter(Boolean).join(' — ') ||
    `Proyek arsitektur ${project.title} oleh Rektelier.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: seoDescription,
    ...(shareImage ? { image: shareImage } : {}),
    ...(project.location ? { locationCreated: { '@type': 'Place', name: project.location } } : {}),
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    creator: { '@type': 'Organization', name: 'Rektelier' },
  };

  return (
    <div className="animate-fadeInUp">
      <Seo
        title={project.title}
        path={`/project/${project.slug}`}
        description={seoDescription}
        image={shareImage}
        type="article"
        jsonLd={jsonLd}
      />

      {project.video_url ? (
        <video
          src={`${ASSET_BASE}${project.video_url}`}
          autoPlay muted loop playsInline
          preload="auto"
          className="w-full h-[60vh] md:h-screen object-cover"
        />
      ) : project.header_image ? (
        <img
          src={`${ASSET_BASE}${project.header_image}`}
          alt={project.title}
          fetchPriority="high"
          decoding="async"
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
            {media.map((item, i) =>
              item.media_type === 'video' ? (
                <video
                  key={item.id}
                  src={`${ASSET_BASE}${item.image_url}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  className="w-full h-auto block"
                />
              ) : (
                <img
                  key={item.id}
                  src={`${ASSET_BASE}${item.image_url}`}
                  alt={`${project.title} — foto ${i + 1}`}
                  loading="lazy"
                  decoding="async"
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