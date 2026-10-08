import TransitionLink from './TransitionLink';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

function isVideoUrl(url) {
  return /\.(mp4|webm)$/i.test(url || '');
}

export default function ProjectCard({ project, priority = false }) {
  const src = project.cover_image ? `${ASSET_BASE}${project.cover_image}` : '';
  const isVideo = isVideoUrl(project.cover_image);

  return (
    <TransitionLink to={`/project/${project.slug}`} className="relative overflow-hidden group block w-full h-full">
      {isVideo ? (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? 'auto' : 'metadata'}
          className="w-full h-full object-cover block"
        />
      ) : (
        <img
          src={src}
          alt={project.title}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className="w-full h-full object-cover block"
        />
      )}
      <div className="absolute inset-0 bg-white/85 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.17,0.67,1,1.23)]">
        <span className="uppercase text-sm md:text-lg font-medium text-center px-4">
          {project.title}
        </span>
      </div>
    </TransitionLink>
  );
}