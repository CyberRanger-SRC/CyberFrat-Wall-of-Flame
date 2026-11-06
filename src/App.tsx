import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TvView } from './components/views/TvView';
import { UltrawideView } from './components/views/UltrawideView';
import { MobileKioskView } from './components/views/MobileKioskView';
import { ControlDeckView } from './components/views/ControlDeckView';
import { INITIAL_DIYAS, TARGET_DIYAS_COUNT } from './data/defaultDiyas';
import { DiyaData } from './types';
import { soundManager } from './utils/sound';
import { syncService, SyncMessage } from './utils/sync';
import { Tv, Monitor, QrCode, Sliders, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'cyberfrat_diwali_real_diyas_v5';

export type AppViewMode = 'tv' | 'ultrawide' | 'mobile' | 'control';

export function App() {
  // Determine initial view from URL query param (?view=tv, ?view=ultrawide, etc.)
  const [currentView, setCurrentView] = useState<AppViewMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view') as AppViewMode;
      if (v === 'tv' || v === 'ultrawide' || v === 'mobile' || v === 'control') {
        return v;
      }
    }
    // Default to ultrawide view if wide aspect ratio, or ultrawide for kiosk
    return 'ultrawide';
  });

  // Load saved diyas
  const [diyas, setDiyas] = useState<DiyaData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_DIYAS;
  });

  const [selectedDiya, setSelectedDiya] = useState<DiyaData | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [isFinale, setIsFinale] = useState(false);
  const [targetCount] = useState(TARGET_DIYAS_COUNT);
  const [showNavSwitcher, setShowNavSwitcher] = useState(true);

  // Save to localStorage whenever diyas change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(diyas));
    } catch {
      // ignore
    }
  }, [diyas]);

  // Sync state across multiple tabs/monitors/windows
  useEffect(() => {
    const unsubscribe = syncService.subscribe((msg: SyncMessage) => {
      if (msg.type === 'DIYA_ADDED' && msg.payload?.diya) {
        const added = msg.payload.diya;
        setDiyas((prev) => {
          if (prev.some((d) => d.id === added.id)) return prev;
          return [...prev, added];
        });
        setNewlyAddedId(added.id);
        setSelectedDiya(added);
        soundManager.playDiyaIgniteSound();

        setTimeout(() => {
          setSelectedDiya((curr) => (curr?.id === added.id ? null : curr));
          setNewlyAddedId(null);
        }, 5500);
      } else if (msg.type === 'DIYA_SELECTED') {
        if (msg.payload?.diyaId) {
          const found = diyas.find((d) => d.id === msg.payload?.diyaId);
          if (found) setSelectedDiya(found);
        } else {
          setSelectedDiya(null);
        }
      } else if (msg.type === 'FINALE_TRIGGERED') {
        setIsFinale(true);
        soundManager.playFinaleBurst();
        triggerConfettiFX();
      } else if (msg.type === 'FINALE_DISMISSED') {
        setIsFinale(false);
      } else if (msg.type === 'RESET_ALL') {
        setDiyas([]);
        setSelectedDiya(null);
        setIsFinale(false);
      }
    });

    return () => unsubscribe();
  }, [diyas]);

  // Poll for any diyas added remotely via Amazon Alexa
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/alexa');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.diyas) && data.diyas.length > 0) {
            setDiyas((prev) => {
              const existingIds = new Set(prev.map((d) => d.id));
              const newFromAlexa = data.diyas.filter((d: any) => !existingIds.has(d.id));
              if (newFromAlexa.length > 0) {
                soundManager.playDiyaIgniteSound();
                return [...prev, ...newFromAlexa];
              }
              return prev;
            });
          }
        }
      } catch {
        // Local preview or offline fallback
      }
    }, 3500);

    return () => clearInterval(pollInterval);
  }, []);

  // Illumination progress: 0.0 to 1.0
  const progress = Math.min(1.0, diyas.length / targetCount);

  // Confetti explosion helper
  const triggerConfettiFX = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffe082', '#ffb300', '#ffd54f', '#ff8f00', '#ffffff'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ffe082', '#ffd54f', '#ff9800'],
      });
    }, 400);
  }, []);

  // Trigger Grand Finale
  const handleToggleFinale = () => {
    const nextState = !isFinale;
    setIsFinale(nextState);
    if (nextState) {
      soundManager.playFinaleBurst();
      triggerConfettiFX();
      syncService.broadcast('FINALE_TRIGGERED');
    } else {
      syncService.broadcast('FINALE_DISMISSED');
    }
  };

  // Add Diya
  const handleLightDiya = (newDiyaData: Omit<DiyaData, 'id' | 'anchorIndex' | 'timestamp'>) => {
    const nextIndex = diyas.length;
    const newId = `diya-${Date.now()}`;
    const newDiya: DiyaData = {
      ...newDiyaData,
      id: newId,
      anchorIndex: nextIndex,
      timestamp: new Date().toISOString(),
    };

    setDiyas((prev) => [...prev, newDiya]);
    setNewlyAddedId(newId);
    setSelectedDiya(newDiya);

    soundManager.playDiyaIgniteSound();
    syncService.broadcast('DIYA_ADDED', { diya: newDiya });

    setTimeout(() => {
      setSelectedDiya((curr) => (curr?.id === newId ? null : curr));
      setNewlyAddedId(null);
    }, 5500);
  };

  // Select / Spotlight Diya
  const handleSelectDiya = (diya: DiyaData) => {
    setSelectedDiya(diya);
    syncService.broadcast('DIYA_SELECTED', { diyaId: diya.id });
  };

  const handleDeselect = () => {
    setSelectedDiya(null);
    syncService.broadcast('DIYA_SELECTED', { diyaId: null });
  };

  // Demo helpers
  const handleAddDemoDiyas = (count: number) => {
    const sampleNames = [
      'Gaurav Batra', 'Ananya Sharma', 'Vikram Roy', 'Smita Rao',
      'Rohan Deshmukh', 'Meenakshi Iyer', 'Arjun Nair', 'Kavita Menon'
    ];
    const sampleChapters = [
      'CyberFrat Mumbai', 'Cloud Security SIG', 'CyberFrat Bangalore',
      'Red Team Group', 'CyberFrat Delhi', 'Global SIG'
    ];
    const sampleQuotes = [
      'May your passwords be strong and your sweets be infinite! 🍬🔐',
      'Zero vulnerabilities, zero bugs, and 100% Kaju Katli! 🥮🛡️',
      'Firewalls by day, Firecrackers by night! 💥🚀',
      'Encrypting my blessings with 4096-bit golden love! 🔒✨',
    ];
    const metals: ('brass' | 'antique-gold' | 'copper')[] = ['brass', 'antique-gold', 'copper'];

    const newItems: DiyaData[] = [];
    const startIndex = diyas.length;

    for (let i = 0; i < count; i++) {
      const idx = startIndex + i;
      newItems.push({
        id: `demo-${Date.now()}-${i}`,
        name: sampleNames[(idx + i) % sampleNames.length],
        chapter: sampleChapters[(idx + i) % sampleChapters.length],
        message: sampleQuotes[(idx + i) % sampleQuotes.length],
        anchorIndex: idx,
        timestamp: new Date().toISOString(),
        metalColor: metals[i % metals.length],
      });
    }

    setDiyas((prev) => [...prev, ...newItems]);
    soundManager.playDiyaIgniteSound();
    newItems.forEach((d) => syncService.broadcast('DIYA_ADDED', { diya: d }));
  };

  const handleResetDiyas = () => {
    setDiyas([]);
    setSelectedDiya(null);
    setIsFinale(false);
    syncService.broadcast('RESET_ALL');
  };

  // Change view and update URL query
  const changeView = (v: AppViewMode) => {
    setCurrentView(v);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', v);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#030308] relative">
      {/* View Switcher Floating Bar (Can be hidden during presentation) */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/75 backdrop-blur-xl border border-amber-400/30 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
          <button
            onClick={() => changeView('ultrawide')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'ultrawide'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(255,180,0,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Wall of Flame</span>
          </button>

          <button
            onClick={() => changeView('tv')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'tv'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(255,180,0,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>65" TV Display</span>
          </button>

          <button
            onClick={() => changeView('mobile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'mobile'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(255,180,0,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Laptop 1 / Phone QR</span>
          </button>

          <button
            onClick={() => changeView('control')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'control'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(255,180,0,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Laptop 2 Director</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {currentView === 'tv' && (
        <TvView
          diyas={diyas}
          selectedDiya={selectedDiya}
          newlyAddedId={newlyAddedId}
          progress={progress}
          isFinale={isFinale}
          onSelectDiya={handleSelectDiya}
          onDeselect={handleDeselect}
          onDismissFinale={() => setIsFinale(false)}
          targetCount={targetCount}
        />
      )}

      {currentView === 'ultrawide' && (
        <UltrawideView
          diyas={diyas}
          selectedDiya={selectedDiya}
          newlyAddedId={newlyAddedId}
          progress={progress}
          isFinale={isFinale}
          onLightDiya={handleLightDiya}
          onSelectDiya={handleSelectDiya}
          onDeselect={handleDeselect}
          onToggleFinale={handleToggleFinale}
          targetCount={targetCount}
        />
      )}

      {currentView === 'mobile' && (
        <MobileKioskView
          onLightDiya={handleLightDiya}
          diyasCount={diyas.length}
          targetCount={targetCount}
        />
      )}

      {currentView === 'control' && (
        <ControlDeckView
          diyas={diyas}
          selectedDiya={selectedDiya}
          targetCount={targetCount}
          progress={progress}
          isFinale={isFinale}
          onSelectDiya={handleSelectDiya}
          onDeselect={handleDeselect}
          onToggleFinale={handleToggleFinale}
          onAddDemoDiyas={handleAddDemoDiyas}
          onResetDiyas={handleResetDiyas}
          onFireConfetti={triggerConfettiFX}
        />
      )}
    </div>
  );
}

export default App;
