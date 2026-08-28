import { useEffect, useState } from 'react';
import client from '../api/client';

const ASSET_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

const ABOUT_HEADER_IMAGES = [
  '/about-1.jpg',
  '/about-2.jpg',
  '/about-3.jpg',
];

const SLIDE_INTERVAL = 5000;
const FADE_DURATION = 1500;

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function AboutHeaderSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ABOUT_HEADER_IMAGES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[50vh] md:h-[85vh] overflow-hidden bg-rektelier-black">
      {ABOUT_HEADER_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: `${FADE_DURATION}ms`,
          }}
        />
      ))}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {ABOUT_HEADER_IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Gambar ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-white opacity-100' : 'w-1.5 bg-white opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function About() {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    client.get('/team').then((res) => setTeam(res.data)).catch(() => {});
  }, []);

  const active = team.filter((m) => !m.is_former);
  const former = team.filter((m) => m.is_former);

  return (
    <div className="pt-16 md:pt-20 pb-16 animate-fadeInUp">
      <AboutHeaderSlider />

      <div className="px-6 max-w-6xl mx-auto pt-12">
        <div className="max-w-2xl mb-12">
          <p className="text-sm leading-relaxed mb-4">
            Rektelier adalah studio arsitek yang berfokus pada karya kontemporer, dengan konsep unik
            yang berkembang melalui karakteristik khusus di setiap proyek.
          </p>
          <p className="text-sm leading-relaxed">
            Rektelier menawarkan desain terintegrasi untuk master plan, arsitektur, lanskap, dan interior.
            Kami memposisikan diri sebagai partner klien, bukan sekadar konsultan.
          </p>
        </div>

        <div className="mb-12 text-sm">
          <h2 className="font-bold uppercase mb-3">Contact</h2>
          <p className="text-rektelier-muted mb-4">Indonesia</p>
          <p className="mb-1">Business inquiry</p>
          <p className="text-rektelier-muted mb-4">hello@rektelier.com</p>
          <p className="mb-1">Press / Job / Internship</p>
          <p className="text-rektelier-muted">info@rektelier.com</p>
        </div>

        <div className="mb-16 text-sm">
          <h2 className="font-bold uppercase mb-3">Social Media</h2>
          <div className="flex gap-6">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-rektelier-muted transition-colors">
              <InstagramIcon />
              Instagram
            </a>
            <a href="mailto:hello@rektelier.com" className="flex items-center gap-2 hover:text-rektelier-muted transition-colors">
              <EmailIcon />
              Email
            </a>
          </div>
        </div>

        <h2 className="text-lg font-bold uppercase mb-6">People</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
          {active.map((member) => (
            <div key={member.id} className="relative group">
              <div className="relative w-full pb-[125%] overflow-hidden bg-gray-100">
                {member.photo_url && (
                  <img
                    src={`${ASSET_BASE}${member.photo_url}`}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                )}
                <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.17,0.67,1,1.23)] p-4 text-center">
                  <div className="transform translate-y-[-1rem] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.17,0.67,1,1.23)]">
                    <p className="text-sm font-normal">{member.name}</p>
                    <p className="text-xs text-rektelier-muted">{member.position}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {former.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase mb-4">Former</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm text-rektelier-muted">
              {former.map((member) => (
                <span key={member.id}>{member.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
