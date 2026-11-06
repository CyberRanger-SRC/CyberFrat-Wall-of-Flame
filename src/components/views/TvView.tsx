import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, Volume2, VolumeX, Flame, Sparkles } from 'lucide-react';
import { DiyaExperience } from '../canvas/DiyaExperience';
import { DiyaDetailCard } from '../ui/DiyaDetailCard';
import { GrandFinaleBanner } from '../ui/GrandFinaleBanner';
import { DiyaData } from '../../types';
import { soundManager } from '../../utils/sound';

interface TvViewProps {
  diyas: DiyaData[];
  selectedDiya: DiyaData | null;
  newlyAddedId: string | null;
  progress: number;
  isFinale: boolean;
  onSelectDiya: (diya: DiyaData) => void;
  onDeselect: () => void;
  onDismissFinale: () => void;
  targetCount: number;
}

export const TvView: React.FC<TvViewProps> = ({
  diyas,
  selectedDiya,
  newlyAddedId,
  progress,
  isFinale,
  onSelectDiya,
  onDeselect,
  onDismissFinale,
  targetCount,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleToggleSound = () => {
    const unmuted = soundManager.toggleMute();
    setIsMuted(!unmuted);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#030308] relative select-none">
      {/* 3D Canvas */}
      <DiyaExperience
        diyas={diyas}
        selectedDiya={selectedDiya}
        newlyAddedId={newlyAddedId}
        progress={progress}
        isFinale={isFinale}
        onSelectDiya={onSelectDiya}
        onDeselect={onDeselect}
        aspectMode="standard"
      />

      {/* Floating Top Installation Brand (Discreet and Regal) */}
      <div className="absolute top-8 left-8 z-30 pointer-events-none flex items-center gap-3">
        <div className="px-5 py-2.5 rounded-full bg-black/60 backdrop-blur-2xl border border-amber-400/30 flex items-center gap-3 shadow-[0_0_30px_rgba(255,180,0,0.25)]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-cinzel font-black tracking-widest uppercase text-amber-200">
            CyberFrat Diwali • 65" Installation
          </span>
          <span className="text-zinc-500">|</span>
          <span className="text-xs font-mono text-amber-300">
            {diyas.length} / {targetCount} Diyas Lit ({Math.round(progress * 100)}% Filled)
          </span>
        </div>
      </div>

      {/* Discreet Audio & Fullscreen Toggle (Top Right) */}
      <div className="absolute top-8 right-8 z-30 flex items-center gap-2.5">
        <button
          onClick={handleToggleSound}
          className={`p-3 rounded-full backdrop-blur-xl border transition-all ${
            !isMuted
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(255,180,0,0.3)]'
              : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Ambient Chimes' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={handleToggleFullscreen}
          className="p-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-white transition-all"
          title="Toggle Fullscreen (F11)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Contributor Diya Detail Card with Cute/Funny Quote */}
      <DiyaDetailCard
        diya={selectedDiya}
        onClose={onDeselect}
      />

      {/* Grand Finale Cinematic Banner */}
      <GrandFinaleBanner
        active={isFinale}
        onDismiss={onDismissFinale}
      />
    </div>
  );
};

