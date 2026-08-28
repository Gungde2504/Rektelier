import { useEffect, useState } from 'react';

export default function Preloader() {
  const [show, setShow] = useState(() => !sessionStorage.getItem('rektelierSplashShown'));
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!show) return;
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const hideTimer = setTimeout(() => {
      sessionStorage.setItem('rektelierSplashShown', 'true');
      setShow(false);
    }, 2300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-black via-gray-400 to-black bg-[length:200%_auto] animate-shimmer">
        REKTELIER
      </h1>
    </div>
  );
}