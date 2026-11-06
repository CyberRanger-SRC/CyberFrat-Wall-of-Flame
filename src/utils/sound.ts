// Web Audio API procedural sound engine for cinematic Diwali ambiance

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private isPlayingAmbient: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.init();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.45;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
      if (!this.isMuted && !this.isPlayingAmbient) {
        this.startAmbientPad();
      }
    }
    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Meditative warm golden drone pad (F# and C# warm fifths with soft detuning)
  private startAmbientPad() {
    if (!this.ctx || !this.masterGain || this.isPlayingAmbient) return;
    this.isPlayingAmbient = true;

    // Frequencies for a warm, celestial ambient drone (F#2, C#3, F#3, A#3)
    const freqs = [92.5, 138.59, 185.0, 233.08];

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    padGain.connect(this.masterGain);
    filter.connect(padGain);

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      // Subtle organic detune
      osc.detune.setValueAtTime((idx % 2 === 0 ? 3 : -3) * (idx + 1), this.ctx.currentTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      // Low frequency oscillator for gentle breathing swell
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.04, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);

      osc.connect(filter);
      osc.start();
      lfo.start();
      this.ambientOscs.push(osc);
    });
  }

  // Golden chime when a diya is ignited
  public playDiyaIgniteSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Multi-harmonic chime (temple bell / singing bowl harmonics)
    const notes = [587.33, 880.0, 1174.66, 1760.0]; // D5, A5, D6, A6

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Delicate envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2 / (idx + 1), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2 + idx * 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.0);
    });
  }

  // Grand celebration burst chord
  public playFinaleBurst() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const chords = [293.66, 440.0, 587.33, 739.99, 880.0, 1174.66]; // D major radiant chord

    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 5.0);
    });
  }
}

export const soundManager = new SoundEngine();

