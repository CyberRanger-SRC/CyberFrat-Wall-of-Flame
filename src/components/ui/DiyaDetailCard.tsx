import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Sparkles, MapPin } from 'lucide-react';
import { DiyaData } from '../../types';

interface DiyaDetailCardProps {
  diya: DiyaData | null;
  onClose: () => void;
}

export const DiyaDetailCard: React.FC<DiyaDetailCardProps> = ({ diya, onClose }) => {
  return (
    <AnimatePresence>
      {diya && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-8 right-8 z-40 max-w-sm w-[90vw] pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-[#0a0a14]/90 backdrop-blur-xl border border-amber-400/40 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(255,180,50,0.25)]">
            {/* Ambient golden top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-amber-300 hover:bg-white/5 transition-all"
              title="Close card"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Diya icon and number */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-500/15 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(255,160,0,0.35)]">
                <Flame className="w-5 h-5 fill-amber-400 text-amber-500 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 inline" /> Happy Diwali!
                </span>
                <h3 className="text-xl font-cinzel font-bold text-white tracking-wide">
                  {diya.name}
                </h3>
              </div>
            </div>

            {/* Chapter / Designation */}
            {diya.chapter && (
              <div className="flex items-center gap-1.5 text-xs text-amber-200/90 mb-3 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 w-fit">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{diya.chapter}</span>
              </div>
            )}

            {/* Heartfelt Cute / Funny Quote */}
            <div className="relative pl-3.5 border-l-2 border-amber-400/60 py-1.5 my-3 bg-amber-500/5 rounded-r-lg pr-2">
              <p className="text-sm text-amber-100 font-medium leading-relaxed italic">
                "{diya.message}"
              </p>
            </div>

            {/* Bottom info */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-zinc-400">
              <span className="capitalize text-amber-300/90 font-mono">
                {diya.metalColor || 'Brass'} Diya Lit
              </span>
              <span className="text-zinc-500 text-[10px] font-mono">
                The CyberFrat Wall of Flame ✨
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
