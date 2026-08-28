import { useEffect, useState } from 'react';
import client from '../api/client';
import ProjectCard from '../components/ProjectCard';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16 md:pt-20 pb-16 animate-fadeInUp">
      {!loading && projects.length === 0 && (
        <p className="text-center text-rektelier-muted py-20">Belum ada proyek yang tayang.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-6">
        {projects.map((p) => (
          <div key={p.id} className="aspect-[4/3]">
            <ProjectCard project={p} />
          </div>
        ))}
      </div>
    </div>
  );
}