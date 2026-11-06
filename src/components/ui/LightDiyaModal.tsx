import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Sparkles, Check } from 'lucide-react';
import { DiyaData } from '../../types';

interface LightDiyaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (diya: Omit<DiyaData, 'id' | 'anchorIndex' | 'timestamp'>) => void;
  remainingAnchors: number;
}

const PRESET_WISHES = [
  "May the light of Diwali illuminate our minds and secure our collective future.",
  "From vulnerability to strength, from darkness to light. Happy Deepavali!",
  "Wishing boundless wisdom, joy, and unbroken camaraderie across CyberFrat.",
  "May our fraternity shine as a beacon of trust, resilience, and fellowship.",
];

export const LightDiyaModal: React.FC<LightDiyaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  remainingAnchors,
}) => {
  const [name, setName] = useState('');
  const [chapter, setChapter] = useState('');
  const [message, setMessage] = useState('');
  const [metalColor, setMetalColor] = useState<'brass' | 'antique-gold' | 'copper'>('brass');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      chapter: chapter.trim() || 'CyberFrat Member',
      message: message.trim() || 'Wishing everyone a radiant and blessed Diwali!',
      metalColor,
    });

    setName('');
    setChapter('');
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-3xl bg-[#0c0d16] border border-amber-500/30 p-7 shadow-[0_0_60px_rgba(255,160,0,0.25)] overflow-hidden"
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(255,160,0,0.35)]">
                <Flame className="w-6 h-6 fill-amber-400 text-amber-500 animate-pulse" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> CyberFrat Festival of Lights
                </span>
                <h2 className="text-2xl font-cinzel font-bold text-white tracking-wide">
                  Light Your 3D Diya
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5 font-medium">
                  Your Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-1.5 font-medium">
                  Chapter / Organization / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. CyberFrat Bengaluru / AppSec Specialist"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-300 font-medium">
                    Diwali Wish / Blessing
                  </label>
                  <span className="text-[11px] text-amber-400/80">Select below or write your own</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Share a heartfelt message with the CyberFrat fraternity..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50 transition-all text-sm resize-none"
                />
                
                {/* Preset wishes */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESET_WISHES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessage(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-200 border border-white/10 hover:border-amber-400/40 text-left transition-all"
                    >
                      "{preset.slice(0, 36)}..."
                    </button>
                  ))}
                </div>
              </div>

              {/* Material finish */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-300 mb-2 font-medium">
                  Diya Metal Craft
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'brass', label: 'Royal Brass', color: '#e6b800' },
                    { id: 'antique-gold', label: 'Antique Gold', color: '#c59d28' },
                    { id: 'copper', label: 'Sacred Copper', color: '#c87d55' },
                  ].map((metal) => (
                    <button
                      key={metal.id}
                      type="button"
                      onClick={() => setMetalColor(metal.id as 'brass' | 'antique-gold' | 'copper')}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        metalColor === metal.id
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_12px_rgba(255,180,0,0.2)]'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-white/30"
                          style={{ backgroundColor: metal.color }}
                        />
                        <span>{metal.label}</span>
                      </div>
                      {metalColor === metal.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-cinzel font-bold text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(255,180,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4 fill-black" />
                  Ignite Diya on CyberFrat Logo
                </button>
                <p className="text-center text-[11px] text-zinc-500 mt-2">
                  Your lamp will be permanently affixed to the 3D logo with your name and wish.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

