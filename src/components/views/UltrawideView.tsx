import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Volume2, VolumeX, Send } from 'lucide-react';
import { DiyaData } from '../../types';
import { getRandomQuote } from '../../data/funnyQuotes';
import { soundManager } from '../../utils/sound';
import { alexaVoice } from '../../utils/alexaVoice';
import { HappyDiwaliPopup } from '../ui/HappyDiwaliPopup';
import { AlexaVoiceModal } from '../ui/AlexaVoiceModal';

interface UltrawideViewProps {
  diyas: DiyaData[];
  selectedDiya: DiyaData | null;
  newlyAddedId: string | null;
  progress: number;
  isFinale: boolean;
  onLightDiya: (diya: Omit<DiyaData, 'id' | 'anchorIndex' | 'timestamp'>) => void;
  onSelectDiya: (diya: DiyaData) => void;
  onDeselect: () => void;
  onToggleFinale: () => void;
  targetCount: number;
}

export const UltrawideView: React.FC<UltrawideViewProps> = ({
  diyas,
  selectedDiya,
  newlyAddedId,
  progress,
  isFinale,
  onLightDiya,
  onSelectDiya,
  onDeselect,
  targetCount,
}) => {
  // Simple Single Input State: Just the Name!
  const [name, setName] = useState('');
  const [popupDiya, setPopupDiya] = useState<DiyaData | null>(null);
  const [hoveredDiya, setHoveredDiya] = useState<DiyaData | null>(null);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [isAlexaModalOpen, setIsAlexaModalOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const wallScrollRef = useRef<HTMLDivElement>(null);

  // Handle Diya Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      nameInputRef.current?.focus();
      return;
    }

    // Secretly pick a random cute & funny quote (not seen beforehand!)
    const quote = getRandomQuote();
    const finalQuote = `${quote.text} ${quote.emoji}`;

    const newDiya: DiyaData = {
      id: `diya-${Date.now()}`,
      name: cleanName,
      message: finalQuote,
      anchorIndex: diyas.length,
      timestamp: new Date().toISOString(),
      metalColor: 'brass',
    };

    onLightDiya({
      name: newDiya.name,
      message: newDiya.message,
      metalColor: 'brass',
    });

    // Pop up the Happy Diwali wishing modal with the surprise cute quote!
    setPopupDiya(newDiya);

    // Reset input
    setName('');
    nameInputRef.current?.focus();

    // Scroll to the latest diya
    setTimeout(() => {
      if (wallScrollRef.current) {
        wallScrollRef.current.scrollTo({ top: wallScrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 200);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#030308] flex flex-col justify-between p-6 lg:p-8 select-none text-white font-sans relative">
      {/* Background ambient sacred glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-black opacity-80" />

      {/* ======================================================== */}
      {/* 1. TOP HEADER: Wall of Flame Title & Lamp Counter         */}
      {/* ======================================================== */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(255,180,0,0.3)]">
            <Flame className="w-6 h-6 fill-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400 font-semibold">
                CyberFrat Festival of Lights
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono text-[10px]">
                {diyas.length} Flames Burning
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-cinzel font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500">
              The CyberFrat Wall of Flame
            </h1>
          </div>
        </div>

        {/* Audio & Alexa Voice Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAlexaModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,200,255,0.25)] hover:scale-105"
            title="Alexa Voice Skill Interaction"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Talk to Alexa</span>
          </button>

          <button
            onClick={() => {
              const unmuted = soundManager.toggleMute();
              setIsMuted(!unmuted);
            }}
            className="p-3 rounded-2xl bg-black/60 border border-white/10 text-zinc-300 hover:text-amber-300 hover:border-amber-400/40 transition-all shadow-md"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THE SACRED WALL OF FLAME (Glowing Lamps with Names)   */}
      {/* ======================================================== */}
      <div
        ref={wallScrollRef}
        className="relative z-10 flex-1 my-5 overflow-y-auto pr-3 rounded-3xl bg-black/40 border border-amber-500/20 p-6 backdrop-blur-xl flex flex-col justify-start"
      >
        {diyas.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-500/15 filter blur-xl animate-pulse" />
              <Flame className="w-14 h-14 text-amber-400/60 animate-bounce" />
            </div>
            <h3 className="text-2xl font-cinzel font-bold text-amber-200 mb-2">
              The Wall of Flame Awaits Its First Lamp
            </h3>
            <p className="text-sm text-zinc-400 max-w-md">
              Type your name below and hit Enter to ignite the opening flame of Diwali!
            </p>
          </div>
        ) : (
          /* Stored Visual Diyas Wall: Real glowing lamps with names! */
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 items-end py-4">
            {diyas.map((d, index) => {
              const isNewlyLit = newlyAddedId === d.id;

              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setPopupDiya(d)}
                  onMouseEnter={() => setHoveredDiya(d)}
                  onMouseLeave={() => setHoveredDiya(null)}
                  className={`group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-115 ${
                    isNewlyLit ? 'scale-110' : ''
                  }`}
                >
                  {/* Glowing Diya Flame & Lamp Graphic */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* Flame Warm Aura Glow */}
                    <div className="absolute inset-2 rounded-full bg-amber-500/30 filter blur-lg group-hover:bg-amber-400/50 transition-all animate-pulse" />

                    <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(255,180,0,0.85)]">
                      {/* Flickering Flame */}
                      <path
                        d="M50 15 C54 28, 66 40, 62 55 C58 66, 42 66, 38 55 C34 40, 46 28, 50 15 Z"
                        fill="url(#diyaWallFlame)"
                        className="animate-pulse"
                        style={{
                          transformOrigin: '50px 60px',
                          animationDuration: `${1.0 + (index % 5) * 0.15}s`,
                        }}
                      />
                      {/* Hot flame core */}
                      <path
                        d="M50 26 C52 35, 59 43, 57 52 C55 58, 45 58, 43 52 C41 43, 48 35, 50 26 Z"
                        fill="#ffffff"
                        opacity="0.9"
                      />
                      {/* Wick */}
                      <path d="M49 53 Q50 56 51 59" stroke="#3d2010" strokeWidth="2" strokeLinecap="round" />
                      {/* Ornate Brass Diya Bowl */}
                      <ellipse cx="50" cy="67" rx="30" ry="11" fill="url(#diyaWallBrassRim)" />
                      <path
                        d="M20 67 C22 81, 78 81, 80 67 C82 70, 75 85, 50 85 C25 85, 18 70, 20 67 Z"
                        fill="url(#diyaWallBrassBody)"
                      />
                      {/* Diya Base Foot */}
                      <ellipse cx="50" cy="84" rx="15" ry="3.5" fill="#a67c1e" />

                      <defs>
                        <linearGradient id="diyaWallFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fff8b5" />
                          <stop offset="35%" stopColor="#ffb300" />
                          <stop offset="75%" stopColor="#ff5722" />
                          <stop offset="100%" stopColor="#bf360c" />
                        </linearGradient>
                        <linearGradient id="diyaWallBrassBody" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffe082" />
                          <stop offset="45%" stopColor="#d4af37" />
                          <stop offset="85%" stopColor="#8c6d1f" />
                          <stop offset="100%" stopColor="#4a3608" />
                        </linearGradient>
                        <linearGradient id="diyaWallBrassRim" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6e4f13" />
                          <stop offset="100%" stopColor="#302005" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Stored Participant Name */}
                  <div className="mt-1 px-3 py-1 rounded-xl bg-black/60 border border-amber-400/30 text-center max-w-[110px] shadow-md group-hover:border-amber-400 group-hover:bg-amber-500/20 transition-all">
                    <span className="text-xs font-cinzel font-bold text-amber-200 truncate block">
                      {d.name}
                    </span>
                  </div>

                  {/* Hover Quote Tooltip */}
                  {hoveredDiya?.id === d.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute bottom-full mb-2 z-40 w-48 p-3 rounded-2xl bg-[#0e0f1e]/95 border border-amber-400/50 shadow-2xl text-center pointer-events-none"
                    >
                      <p className="text-xs text-amber-100 font-medium italic">
                        "{d.message}"
                      </p>
                      <div className="text-[10px] text-amber-400 mt-1 font-mono">Click to view ✨</div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. SIMPLE, UNCOMPLICATED INPUT: Just Enter Name & Hit ↵  */}
      {/* ======================================================== */}
      <div className="relative z-10 max-w-2xl mx-auto w-full pt-2">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 p-2 rounded-2xl bg-black/75 backdrop-blur-2xl border-2 border-amber-400/50 shadow-[0_0_35px_rgba(255,180,0,0.3)]"
        >
          <div className="pl-4 text-amber-400">
            <Flame className="w-6 h-6 fill-amber-400 animate-pulse" />
          </div>

          <input
            ref={nameInputRef}
            type="text"
            required
            placeholder="Type your name and hit Enter..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-3 rounded-xl bg-transparent text-white placeholder-zinc-500 focus:outline-none text-base font-cinzel font-bold"
            autoFocus
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-cinzel font-black text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(255,180,0,0.5)] disabled:opacity-40 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            Light Diya 🪔
          </button>
        </form>
        <p className="text-center text-[11px] text-zinc-400 font-mono mt-2 opacity-80">
          ✨ Type your name to light your diya & reveal your festive awareness thought!
        </p>
      </div>

      {/* ======================================================== */}
      {/* 4. HAPPY DIWALI POPUP WITH SURPRISE CUTE QUOTE           */}
      {/* ======================================================== */}
      <HappyDiwaliPopup
        diya={popupDiya}
        onClose={() => setPopupDiya(null)}
      />

      {/* ======================================================== */}
      {/* 5. INTERACTIVE ALEXA VOICE DIALOG MODAL                  */}
      {/* ======================================================== */}
      <AlexaVoiceModal
        isOpen={isAlexaModalOpen}
        onClose={() => setIsAlexaModalOpen(false)}
        onLightDiya={onLightDiya}
      />
    </div>
  );
};
