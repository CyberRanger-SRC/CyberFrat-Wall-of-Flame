import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { DiyaData } from '../../types';

interface HappyDiwaliPopupProps {
  diya: DiyaData | null;
  onClose: () => void;
}

export const HappyDiwaliPopup: React.FC<HappyDiwaliPopupProps> = ({ diya, onClose }) => {
  if (!diya) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Celebratory Wishing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#141528] via-[#0c0d18] to-[#05060b] border border-amber-400/50 p-8 text-center shadow-[0_0_80px_rgba(255,180,0,0.4)] overflow-hidden"
        >
          {/* Top Golden Light Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 shadow-[0_0_20px_#ffd54f]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Festive Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-mono font-semibold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(255,180,0,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            Festival of Lights
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          {/* Glowing Animated Diya */}
          <div className="relative w-28 h-28 mx-auto mb-2 flex items-center justify-center">
            {/* Golden aura pulse */}
            <div className="absolute inset-0 rounded-full bg-amber-500/25 filter blur-xl animate-pulse" />

            <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-[0_0_25px_rgba(255,180,0,0.85)]">
              {/* Flame Outer */}
              <path
                d="M60 18 C65 34, 80 48, 75 66 C70 80, 50 80, 45 66 C40 48, 55 34, 60 18 Z"
                fill="url(#popupFlameGrad)"
                className="animate-pulse"
                style={{ transformOrigin: '60px 75px', animationDuration: '1.1s' }}
              />
              {/* Flame Hot Center */}
              <path
                d="M60 32 C62 44, 71 53, 69 64 C67 72, 53 72, 51 64 C49 53, 58 44, 60 32 Z"
                fill="#ffffff"
                opacity="0.95"
              />
              {/* Wick */}
              <path d="M58 65 Q60 68 61 72" stroke="#3d2010" strokeWidth="2.5" strokeLinecap="round" />
              {/* Diya Bowl */}
              <ellipse cx="60" cy="80" rx="36" ry="14" fill="url(#popupBrassRim)" />
              <path
                d="M24 80 C26 97, 94 97, 96 80 C98 84, 90 102, 60 102 C30 102, 22 84, 24 80 Z"
                fill="url(#popupBrassBody)"
              />
              {/* Diya Foot */}
              <ellipse cx="60" cy="101" rx="19" ry="4" fill="#a67c1e" />

              <defs>
                <linearGradient id="popupFlameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fff8b5" />
                  <stop offset="35%" stopColor="#ffb300" />
                  <stop offset="75%" stopColor="#ff5722" />
                  <stop offset="100%" stopColor="#bf360c" />
                </linearGradient>
                <linearGradient id="popupBrassBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffe082" />
                  <stop offset="45%" stopColor="#d4af37" />
                  <stop offset="85%" stopColor="#8c6d1f" />
                  <stop offset="100%" stopColor="#4a3608" />
                </linearGradient>
                <linearGradient id="popupBrassRim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6e4f13" />
                  <stop offset="100%" stopColor="#302005" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Happy Diwali Wishing Title */}
          <h2 className="text-3xl sm:text-4xl font-cinzel font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#ffb300] drop-shadow-[0_2px_15px_rgba(255,200,50,0.5)] mb-3">
            Happy Diwali, {diya.name}!
          </h2>

          {/* Surprise Cute, Funny & Thoughtful Awareness Quote Box */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border border-amber-400/50 my-4 shadow-inner">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300/90 font-semibold mb-1.5 block">
              ✨ Festive Awareness Thought ✨
            </span>
            <p className="text-base sm:text-lg text-amber-100 font-medium italic leading-relaxed">
              "{diya.message}"
            </p>
          </div>

          <p className="text-xs text-zinc-300 font-light mb-6">
            Your lamp is now burning bright on The Wall of Flame! ✨
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-cinzel font-black text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(255,180,0,0.4)] transition-all hover:scale-[1.02]"
          >
            View The Wall of Flame &rarr;
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
