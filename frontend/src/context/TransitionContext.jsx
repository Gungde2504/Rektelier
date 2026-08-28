import { createContext, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TransitionContext = createContext(null);

const HOLD_DURATION = 900;   // overlay full menutupi sebelum pindah halaman
const SETTLE_DURATION = 300; // jeda setelah halaman baru dimuat, sebelum mulai fade
const FADE_DURATION = 500;   // durasi fade out

export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const timers = useRef([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function goTo(to) {
    clearTimers();
    setFadeOut(false);
    setVisible(true);
    const navTimer = setTimeout(() => {
      navigate(to);
      const fadeTimer = setTimeout(() => setFadeOut(true), SETTLE_DURATION);
      const hideTimer = setTimeout(() => setVisible(false), SETTLE_DURATION + FADE_DURATION);
      timers.current.push(fadeTimer, hideTimer);
    }, HOLD_DURATION);
    timers.current.push(navTimer);
  }

  return (
    <TransitionContext.Provider value={{ goTo }}>
      {children}
      {visible && (
        <div
          className={`fixed inset-0 z-[9998] bg-white flex items-center justify-center transition-opacity duration-500 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <h1 className="font-['Helvetica_Neue',Helvetica,Arial,'Lucida_Grande',sans-serif] text-2xl md:text-4xl uppercase font-normal tracking-[0.4px] [transform:scaleY(0.85)] leading-none bg-clip-text text-transparent bg-gradient-to-r from-black via-gray-400 to-black bg-[length:200%_auto] animate-shimmer">
            Rektelier
          </h1>
        </div>
      )}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('useTransition harus dipakai di dalam TransitionProvider');
  return ctx;
}