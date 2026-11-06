import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Flame, Sparkles, Check, ArrowRight } from 'lucide-react';
import { alexaVoice } from '../../utils/alexaVoice';
import { getRandomQuote } from '../../data/funnyQuotes';
import { DiyaData } from '../../types';

interface AlexaVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLightDiya: (diya: Omit<DiyaData, 'id' | 'anchorIndex' | 'timestamp'>) => void;
}

export const AlexaVoiceModal: React.FC<AlexaVoiceModalProps> = ({
  isOpen,
  onClose,
  onLightDiya,
}) => {
  const [step, setStep] = useState<'NAME' | 'CONFIRM' | 'FINISHED'>('NAME');
  const [userName, setUserName] = useState('');
  const [assignedQuote, setAssignedQuote] = useState('');
  const [userChoseYes, setUserChoseYes] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('NAME');
      setUserName('');
      setUserChoseYes(null);
      const q = getRandomQuote();
      setAssignedQuote(`${q.text} ${q.emoji}`);

      // Alexa speaks prompt 1
      alexaVoice.speak("Hello! Welcome to CyberFrat's Festival of Lights. What is your name?");
    } else {
      alexaVoice.stop();
    }
  }, [isOpen]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = userName.trim();
    if (!clean) return;

    setStep('CONFIRM');
    // Alexa speaks prompt 2
    alexaVoice.speak(`Hello ${clean}! Do you want to light a diya on the CyberFrat Wall of Flame?`);
  };

  const handleAnswerYes = () => {
    setUserChoseYes(true);
    setStep('FINISHED');

    // Add Diya to the live Wall of Flame
    onLightDiya({
      name: userName.trim(),
      message: assignedQuote,
      metalColor: 'brass',
    });

    // Alexa speaks celebration ending
    alexaVoice.speak(
      `Wonderful, ${userName}! Your diya has been lit and is now shining bright on the CyberFrat Wall of Flame! ` +
      `A very Happy Diwali to you and your family! Here is your festive awareness thought: ${assignedQuote}. ` +
      `Keep shining and stay cyber safe!`
    );
  };

  const handleAnswerNo = () => {
    setUserChoseYes(false);
    setStep('FINISHED');

    // Alexa speaks polite ending with quote
    alexaVoice.speak(
      `No problem, ${userName}! Wishing you and your loved ones a very Happy Diwali! ` +
      `Here is your festive awareness thought: ${assignedQuote}. ` +
      `Have a wonderful celebration and stay safe!`
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Container with Alexa Blue/Cyan Light Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#09152b] via-[#070b18] to-[#04060d] border border-cyan-400/40 p-8 text-center shadow-[0_0_80px_rgba(0,180,255,0.3)] overflow-hidden"
        >
          {/* Top Alexa Glowing Cyan Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 shadow-[0_0_20px_#00e5ff]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Alexa Pulsing Ring Icon */}
          <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-40" />
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(0,200,255,0.6)]">
              <Mic className="w-8 h-8" />
            </div>
          </div>

          <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold mb-2">
            Amazon Alexa Interactive Voice Skill
          </div>

          {/* Step 1: User provides Name */}
          {step === 'NAME' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-cinzel font-bold text-white">
                "Hello! Welcome to CyberFrat's Festival of Lights. What is your name?"
              </h2>

              <form onSubmit={handleNameSubmit} className="pt-2">
                <input
                  type="text"
                  required
                  placeholder="Type your name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-cyan-400/50 text-white placeholder-zinc-400 text-center text-lg font-cinzel font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!userName.trim()}
                  className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-cinzel font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(0,200,255,0.4)] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Confirm Diya Lighting */}
          {step === 'CONFIRM' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <h2 className="text-2xl font-cinzel font-bold text-white">
                "Hello {userName}! Do you wanna light a diya on the CyberFrat Wall of Flame?"
              </h2>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <button
                  onClick={handleAnswerYes}
                  className="py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-cinzel font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,180,0,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <Flame className="w-5 h-5 fill-black" />
                  <span>Yes, Light Diya!</span>
                </button>

                <button
                  onClick={handleAnswerNo}
                  className="py-4 px-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-cinzel font-semibold text-sm transition-all"
                >
                  <span>No thanks</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Finished Celebration */}
          {step === 'FINISHED' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 pt-1"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-amber-300">
                <Flame className="w-6 h-6 fill-amber-400" />
              </div>

              <h2 className="text-3xl font-cinzel font-black text-amber-300">
                Happy Diwali, {userName}!
              </h2>

              {userChoseYes ? (
                <p className="text-xs text-zinc-300">
                  Your diya is now shining bright on the <span className="text-amber-300 font-bold">CyberFrat Wall of Flame</span>!
                </p>
              ) : (
                <p className="text-xs text-zinc-300">
                  Wishing you a joyful, peaceful, and blessed festive season!
                </p>
              )}

              {/* Quote Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-left my-3">
                <span className="text-[10px] font-mono text-amber-300 uppercase font-semibold block mb-1">
                  Festive Awareness Thought:
                </span>
                <p className="text-xs sm:text-sm text-amber-100 italic leading-relaxed">
                  "{assignedQuote}"
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono uppercase tracking-wider transition-all"
              >
                Close & View Wall &rarr;
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

