// In-Browser Alexa Voice Assistant using Web Speech API (for direct venue audio playback & testing)

const ALEXA_GREETING =
  "A very Happy, Radiant, and Blessed Diwali to the entire CyberFrat fraternity, our community leaders, chapter members, and esteemed guests! " +
  "Welcome to our 3D Festival of Lights and The Wall of Flame. " +
  "May this divine light illuminate your minds, empower your careers, and shield your digital lives with joy, prosperity, and zero vulnerabilities! " +
  "Happy Deepavali from CyberFrat!";

class AlexaVoiceService {
  private isSpeaking: boolean = false;

  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Natural cadence
    utterance.pitch = 1.05; // Friendly, clear assistant pitch

    // Try to find a high quality English voice (Google UK English Female / Microsoft Zira / Samantha)
    const voices = window.speechSynthesis.getVoices();
    const assistantVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Female') ||
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Zira') ||
          v.name.includes('Victoria'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (assistantVoice) {
      utterance.voice = assistantVoice;
    }

    this.isSpeaking = true;

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  public greetEveryone(onEnd?: () => void) {
    this.speak(ALEXA_GREETING, onEnd);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const alexaVoice = new AlexaVoiceService();

