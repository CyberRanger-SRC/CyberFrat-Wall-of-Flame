import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, Send, QrCode } from 'lucide-react';
import { DiyaData } from '../../types';
import { getRandomQuote } from '../../data/funnyQuotes';
import { HappyDiwaliPopup } from '../ui/HappyDiwaliPopup';

interface MobileKioskViewProps {
  onLightDiya: (diya: Omit<DiyaData, 'id' | 'anchorIndex' | 'timestamp'>) => void;
  diyasCount: number;
  targetCount: number;
}

export const MobileKioskView: React.FC<MobileKioskViewProps> = ({
  onLightDiya,
  diyasCount,
  targetCount,
}) => {
  const [name, setName] = useState('');
  const [popupDiya, setPopupDiya] = useState<DiyaData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    // Secretly pick a random cute & funny quote (not seen beforehand!)
    const quote = getRandomQuote();
    const finalQuote = `${quote.text} ${quote.emoji}`;

    const newDiya: DiyaData = {
      id: `diya-${Date.now()}`,
      name: cleanName,
      message: finalQuote,
      anchorIndex: diyasCount,
      timestamp: new Date().toISOString(),
      metalColor: 'brass',
    };

    onLightDiya({
      name: newDiya.name,
      message: newDiya.message,
      metalColor: 'brass',
    });

    setPopupDiya(newDiya);
    setName('');
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000/?view=mobile';

  return (
    <div className="min-h-screen w-full bg-[#030308] text-white flex flex-col items-center justify-center p-4 md:p-8 relative selection:bg-amber-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-black opacity-70" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Card: QR Code & Status */}
        <div className="md:col-span-5 flex flex-col items-center text-center p-6 rounded-3xl bg-[#090a14]/90 border border-amber-400/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,180,0,0.15)]">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_20px_rgba(255,180,0,0.3)]">
            <Flame className="w-6 h-6 fill-amber-400 animate-pulse" />
          </div>

          <span className="text-[11px] font-mono tracking-widest uppercase text-amber-400 font-semibold mb-1">
            Laptop / Walk-up Station
          </span>
          <h2 className="text-xl font-cinzel font-bold text-white mb-2">
            CyberFrat Diwali Portal
          </h2>
          <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
            Scan below with your smartphone camera to light a diya from your seat, or type directly on this laptop!
          </p>

          {/* QR Code Container */}
          <div className="p-4 rounded-2xl bg-white shadow-2xl border-2 border-amber-400/60 mb-4 hover:scale-105 transition-transform duration-300">
            <QRCodeSVG
              value={currentUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-medium">
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Scan to Light from Phone</span>
          </div>

          {/* Live Counter */}
          <div className="mt-5 pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs text-zinc-400">
            <span>Flames on the Wall:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {diyasCount} Lamps Lit
            </span>
          </div>
        </div>

        {/* Right Card: Simple Name-Only Diya Form */}
        <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0c0d18]/95 border border-amber-400/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(255,180,0,0.2)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-cinzel font-bold text-white">
                  Light Your Diya
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enter your name to ignite your flame on The CyberFrat Wall of Flame
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-amber-300 mb-2 font-medium">
                Your Full Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-amber-400/40 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 text-base font-cinzel font-bold shadow-inner"
                autoFocus
              />
            </div>

            <p className="text-xs text-zinc-400 italic">
              ✨ A surprise cute & funny Diwali awareness thought will pop up as you light your lamp!
            </p>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-cinzel font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(255,180,0,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 fill-black" />
              Ignite on Wall of Flame 🪔
            </button>
          </form>
        </div>
      </div>

      {/* Happy Diwali Celebration Popup */}
      <HappyDiwaliPopup
        diya={popupDiya}
        onClose={() => setPopupDiya(null)}
      />
    </div>
  );
};
