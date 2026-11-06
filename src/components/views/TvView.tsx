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

      {/* Discreet Audio & Fullscreen Toggle (Fades in on mouse hover) */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2.5 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleToggleSound}
          className={`p-3 rounded-full backdrop-blur-xl border transition-all ${
            !isMuted
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(255,180,0,0.3)]'
              : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Sound FX' : 'Mute Sound'}
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

