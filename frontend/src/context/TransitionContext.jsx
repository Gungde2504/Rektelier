import { createContext, useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TransitionContext = createContext(null);

const HOLD_DURATION = 1600;  // overlay full menutupi sebelum pindah halaman
const SETTLE_DURATION = 600; // jeda setelah halaman baru dimuat = persis durasi animasi fadeInUp (0.6s) di index.css, biar animasi halaman selesai duluan di balik overlay sebelum mulai fade; // jeda setelah halaman baru dimuat (biar animasi masuk halaman selesai duluan di balik overlay), sebelum mulai fade
const FADE_DURATION = 600;   // durasi fade out

const WORD = 'REKTELIER';
const R_DURATION = 550;   // durasi animasi huruf R muncul sendiri
const R_PAUSE = 280;      // jeda setelah R selesai, sebelum EKTELIER menyusul
const REST_START = R_PAUSE; // EKTELIER mulai menyusul R
const REST_STEP = 40;     // jarak antar huruf pada EKTELIER (overlap → terasa mengalir)
const REST_DURATION = 420; // durasi tiap huruf EKTELIER (lebih lama dari REST_STEP = overlap halus)

function getLetterTiming(index) {
  if (index === 0) {
    return { delay: 0, duration: R_DURATION };
  }
  const restIndex = index - 1; // urutan di dalam "EKTELIER"
  return { delay: REST_START + restIndex * REST_STEP, duration: REST_DURATION };
}

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
          className={`fixed inset-0 z-[9998] bg-white flex items-center justify-center transition-opacity duration-[600ms] ease-in-out ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <style>{`
            @keyframes letterReveal {
              from {
                opacity: 0;
                filter: blur(4px);
                transform: scale(0.92);
              }
              to {
                opacity: 1;
                filter: blur(0);
                transform: scale(1);
              }
            }
          `}</style>
          <h1 className="font-['Helvetica_Neue',Helvetica,Arial,'Lucida_Grande',sans-serif] text-2xl md:text-4xl uppercase font-normal tracking-[0.4px] leading-none flex [transform:scaleY(0.85)]">
            {WORD.split('').map((letter, i) => {
              const { delay, duration } = getLetterTiming(i);
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity: 0,
                    willChange: 'opacity, transform, filter',
                    animation: `letterReveal ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                    animationDelay: `${delay}ms`,
                  }}
                >
                  {letter}
                </span>
              );
            })}
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