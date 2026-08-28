import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const FONT_STACK = "font-['Helvetica_Neue',Helvetica,Arial,'Lucida_Grande',sans-serif]";

export default function PageTransition() {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setShow(true);
    setFadeOut(false);
    const fadeTimer = setTimeout(() => setFadeOut(true), 1400);
    const hideTimer = setTimeout(() => setShow(false), 1900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] bg-white flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <h1
        className={`${FONT_STACK} text-2xl md:text-4xl uppercase font-normal tracking-[0.4px] [transform:scaleY(0.85)] leading-none bg-clip-text text-transparent bg-gradient-to-r from-black via-gray-400 to-black bg-[length:200%_auto] animate-shimmer`}
      >
        Rektelier
      </h1>
    </div>
  );
}