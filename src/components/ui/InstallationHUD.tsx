import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  RotateCcw,
  PlusCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface InstallationHUDProps {
  currentCount: number;
  targetCount: number;
  progress: number; // 0 to 1
  isFinale: boolean;
  onOpenLightModal: () => void;
  onToggleFinale: () => void;
  onAddDemoDiyas: (count: number) => void;
  onResetDiyas: () => void;
}

export const InstallationHUD: React.FC<InstallationHUDProps> = ({
  currentCount,
  targetCount,
  progress,
  isFinale,
  onOpenLightModal,
  onToggleFinale,
  onAddDemoDiyas,
  onResetDiyas,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [isExhibitionMode, setIsExhibitionMode] = useState(false);
  const [mouseActive, setMouseActive] = useState(true);

  // Toggle sound
  const handleToggleSound = () => {
    const unmuted = soundManager.toggleMute();
    setIsMuted(!unmuted);
  };

  // Toggle browser fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // In Exhibition Mode, auto-hide HUD after 3 seconds of mouse inactivity
  useEffect(() => {
    if (!isExhibitionMode) {
      setMouseActive(true);
      return;
    }

    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setMouseActive(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setMouseActive(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    timeout = setTimeout(() => setMouseActive(false), 3500);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isExhibitionMode]);

  const percentage = Math.round(progress * 100);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-6">
      {/* Top Bar: Minimal Exhibition Header */}
      <div className="w-full flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: mouseActive ? 1 : 0, y: mouseActive ? 0 : -20 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3.5 pointer-events-auto"
        >
          <div className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-amber-400/20 flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-cinzel tracking-widest uppercase font-semibold text-amber-200">
              CyberFrat Digital Art Installation
            </span>
          </div>
        </motion.div>

        {/* Top Right: Exhibition Mode & Sound Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: mouseActive ? 1 : 0, y: mouseActive ? 0 : -20 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 pointer-events-auto"
        >
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2.5 rounded-full backdrop-blur-xl border transition-all ${
              !isMuted
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(255,180,0,0.3)]'
                : 'bg-black/50 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Ambient Chimes' : 'Mute Ambient Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Exhibition Mode Toggle */}
          <button
            onClick={() => setIsExhibitionMode(!isExhibitionMode)}
            className={`p-2.5 rounded-full backdrop-blur-xl border transition-all ${
              isExhibitionMode
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-black/50 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title={isExhibitionMode ? 'Exit Exhibition Display' : 'Office Display / Gallery Mode'}
          >
            {isExhibitionMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-white transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </motion.div>
      </div>

      {/* Bottom Center: Minimalist Floating Installation Pill */}
      <div className="w-full flex flex-col items-center justify-end">
        {/* Presenter / Demo Controls Drawer */}
        <AnimatePresence>
          {showDemoMenu && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mb-4 p-4 rounded-2xl bg-black/80 backdrop-blur-2xl border border-amber-400/30 shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto flex items-center gap-3 text-xs"
            >
              <span className="text-zinc-400 font-medium">Presenter Presets:</span>
              <button
                onClick={() => onAddDemoDiyas(1)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-amber-500/20 text-white hover:text-amber-300 border border-white/10 flex items-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" /> +1 Diya
              </button>
              <button
                onClick={() => onAddDemoDiyas(5)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-amber-500/20 text-white hover:text-amber-300 border border-white/10 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> +5 Diyas
              </button>
              <button
                onClick={onToggleFinale}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                  isFinale
                    ? 'bg-amber-500 text-black border-amber-400 font-semibold'
                    : 'bg-white/10 hover:bg-amber-500/20 text-amber-300 border-amber-400/40'
                }`}
              >
                {isFinale ? 'Exit Finale' : '🎆 100% Finale'}
              </button>
              <button
                onClick={onResetDiyas}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset (0%)
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Main HUD Pill */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: mouseActive ? 1 : 0, y: mouseActive ? 0 : 30 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-auto flex items-center gap-4 px-5 py-3 rounded-full bg-[#0a0b14]/80 backdrop-blur-2xl border border-amber-400/30 shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(255,180,0,0.2)]"
        >
          {/* Progress & Diya Counter */}
          <div className="flex items-center gap-3 pr-2 border-r border-white/10">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-8 h-8 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  className="stroke-white/10"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  className="stroke-amber-400"
                  strokeWidth="2.5"
                  strokeDasharray={2 * Math.PI * 13}
                  strokeDashoffset={2 * Math.PI * 13 * (1 - progress)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <Flame className="w-4 h-4 absolute text-amber-400 fill-amber-400/80" />
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-cinzel font-bold text-white tracking-wide">
                  {currentCount}
                </span>
                <span className="text-[11px] text-zinc-400">/ {targetCount} Diyas</span>
              </div>
              <div className="text-[10px] text-amber-300/80 font-medium tracking-wider uppercase">
                {percentage}% Illuminated
              </div>
            </div>
          </div>

          {/* Primary Action: Light a Diya */}
          <button
            onClick={onOpenLightModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-cinzel font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(255,180,0,0.4)] transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            Light a Diya
          </button>

          {/* Quick Demo Toggle */}
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className={`p-2 rounded-full border transition-all ${
              showDemoMenu
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Presenter Demo Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

