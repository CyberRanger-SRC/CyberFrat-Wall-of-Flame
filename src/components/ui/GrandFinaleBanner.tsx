import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface GrandFinaleBannerProps {
  active: boolean;
  onDismiss: () => void;
}

export const GrandFinaleBanner: React.FC<GrandFinaleBannerProps> = ({ active, onDismiss }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-6"
        >
          {/* Subtle radial dark overlay vignette */}
          <div className="absolute inset-0 bg-radial-vignette opacity-60" />

          <motion.div
            initial={{ scale: 0.88, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ delay: 0.4, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="relative pointer-events-auto max-w-2xl text-center px-8 py-10 rounded-3xl bg-black/75 backdrop-blur-2xl border border-amber-400/40 shadow-[0_0_80px_rgba(255,180,0,0.35)]"
          >
            {/* Ambient golden top accent */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Close banner"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-6">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              Diwali Milestone Achieved
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            <h1 className="text-3xl sm:text-5xl font-cinzel font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#ffb300] drop-shadow-[0_2px_15px_rgba(255,200,50,0.6)] mb-4">
              ONE TEAM. ONE LIGHT. ONE CYBERFRAT.
            </h1>

            <p className="text-lg sm:text-xl text-amber-100 font-cinzel tracking-widest uppercase opacity-95 mb-6">
              Together, we light up the festival.
            </p>

            <p className="text-sm text-zinc-300 font-light max-w-lg mx-auto leading-relaxed mb-8">
              Every lamp ignited here represents the enduring passion, unity, and vigilance of our global community. May our collective light guide every path forward.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onDismiss}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm shadow-[0_0_25px_rgba(255,180,0,0.4)] transition-all hover:scale-105"
              >
                Immerse in Installation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

