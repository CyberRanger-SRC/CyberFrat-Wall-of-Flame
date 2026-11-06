import React from 'react';
import {
  Sliders,
  Tv,
  Monitor,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  PlusCircle,
  RotateCcw,
  Radio,
  Eye,
  Trash2,
} from 'lucide-react';
import { DiyaData } from '../../types';
import { soundManager } from '../../utils/sound';

interface ControlDeckViewProps {
  diyas: DiyaData[];
  selectedDiya: DiyaData | null;
  targetCount: number;
  progress: number;
  isFinale: boolean;
  onSelectDiya: (diya: DiyaData) => void;
  onDeselect: () => void;
  onToggleFinale: () => void;
  onAddDemoDiyas: (count: number) => void;
  onResetDiyas: () => void;
  onFireConfetti: () => void;
}

export const ControlDeckView: React.FC<ControlDeckViewProps> = ({
  diyas,
  selectedDiya,
  targetCount,
  progress,
  isFinale,
  onSelectDiya,
  onDeselect,
  onToggleFinale,
  onAddDemoDiyas,
  onResetDiyas,
  onFireConfetti,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundManager.getIsMuted());

  const handleToggleSound = () => {
    const unmuted = soundManager.toggleMute();
    setIsMuted(!unmuted);
  };

  return (
    <div className="min-h-screen w-full bg-[#05060d] text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(255,180,0,0.3)]">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
                  Laptop 2 Operator Console
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-300 flex items-center gap-1 font-mono">
                  <Radio className="w-3 h-3 animate-pulse" /> Live Broadcasting
                </span>
              </div>
              <h1 className="text-3xl font-cinzel font-black tracking-wide text-white">
                Diwali Director's Deck
              </h1>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl">
            <div className="px-4 py-1.5 border-r border-white/10">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Diyas Lit</div>
              <div className="text-xl font-bold font-mono text-amber-300">
                {diyas.length} / {targetCount}
              </div>
            </div>
            <div className="px-4 py-1.5 border-r border-white/10">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Fluid Fill</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {Math.round(progress * 100)}%
              </div>
            </div>
            <div className="px-4 py-1.5">
              <div className="text-[10px] uppercase font-mono text-zinc-400">Finale State</div>
              <div className={`text-sm font-bold uppercase font-mono ${isFinale ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`}>
                {isFinale ? '🎆 Active' : 'Idle'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Show & Stage Triggers */}
          <div className="p-6 rounded-3xl bg-black/60 border border-amber-400/20 space-y-4">
            <h3 className="text-sm font-cinzel font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Stage & Finale Triggers
            </h3>

            <button
              onClick={onToggleFinale}
              className={`w-full py-3.5 px-4 rounded-xl border font-cinzel font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
                isFinale
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_25px_rgba(255,180,0,0.5)]'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black border-amber-400/50'
              }`}
            >
              <Flame className="w-4 h-4" />
              {isFinale ? 'End Grand Finale' : '🎆 Trigger 100% Grand Finale'}
            </button>

            <button
              onClick={onFireConfetti}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Fire Golden Confetti Cannons
            </button>

            <button
              onClick={handleToggleSound}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              {isMuted ? 'Unmute Ambient Chimes' : 'Mute Master Audio'}
            </button>
          </div>

          {/* Column 2: Fast-forward Simulation */}
          <div className="p-6 rounded-3xl bg-black/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-cinzel font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" /> Fast-Forward Simulation
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onAddDemoDiyas(1)}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-xs font-medium transition-all"
              >
                +1 Diya (Fluid +3%)
              </button>
              <button
                onClick={() => onAddDemoDiyas(5)}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-xs font-medium transition-all"
              >
                +5 Diyas (Fluid +17%)
              </button>
              <button
                onClick={() => onAddDemoDiyas(15)}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 text-xs font-medium transition-all"
              >
                +15 Diyas (Halfway)
              </button>
              <button
                onClick={onResetDiyas}
                className="py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset (0% Dim)
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Use these buttons to quickly demonstrate how the molten liquid rises and fills the logo for the presentation rehearsal.
            </p>
          </div>

          {/* Column 3: Screen Navigation links */}
          <div className="p-6 rounded-3xl bg-black/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-cinzel font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Tv className="w-4 h-4 text-amber-400" /> Open Target Screens
            </h3>

            <div className="space-y-2">
              <a
                href="/?view=tv"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 text-xs text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Tv className="w-4 h-4 text-amber-400" />
                  <span>Launch 65" TV Display Window</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Open &rarr;</span>
              </a>

              <a
                href="/?view=ultrawide"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 text-xs text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span>Launch Ultrawide Kiosk Window</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Open &rarr;</span>
              </a>

              <a
                href="/?view=mobile"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-400/40 text-xs text-white transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Launch Mobile / Laptop Kiosk</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Open &rarr;</span>
              </a>
            </div>
          </div>
        </div>

        {/* Live Diya Feed & Spotlight Station */}
        <div className="p-6 rounded-3xl bg-black/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-cinzel font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Live Contributor Feed & Spotlight Controller ({diyas.length} Diyas)
            </h3>
            {selectedDiya && (
              <button
                onClick={onDeselect}
                className="text-xs text-amber-400 hover:text-amber-200 font-mono"
              >
                Clear Spotlight (Return All Screens to Overview)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-2">
            {diyas.map((d, index) => {
              const isSpotlighted = selectedDiya?.id === d.id;
              return (
                <div
                  key={d.id}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSpotlighted
                      ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(255,180,0,0.3)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        #{index + 1} • {d.metalColor || 'brass'}
                      </span>
                      {d.chapter && (
                        <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                          {d.chapter}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white">{d.name}</div>
                    <p className="text-xs text-amber-100/90 italic mt-1 line-clamp-2">
                      "{d.message}"
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-end">
                    <button
                      onClick={() => onSelectDiya(d)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                        isSpotlighted
                          ? 'bg-amber-400 text-black font-bold'
                          : 'bg-white/10 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      {isSpotlighted ? 'Spotlighted on TV' : 'Spotlight on 65" TV'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

