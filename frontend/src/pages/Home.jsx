import { useEffect, useState } from 'react';
import client from '../api/client';
import ProjectCard from '../components/ProjectCard';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 md:pt-20 pb-16 animate-fadeInUp">
      {!loading && projects.length === 0 && (
        <p className="text-center text-rektelier-muted py-20">Belum ada proyek yang tayang.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[320px] sm:auto-rows-[220px] lg:auto-rows-[260px] gap-4 px-4 md:px-6">
        {projects.map((p, i) => (
          <div key={p.id} className={i % 5 === 2 ? 'sm:row-span-2' : ''}>
            <ProjectCard project={p} />
          </div>
        ))}
      </div>
    </div>
  );
}