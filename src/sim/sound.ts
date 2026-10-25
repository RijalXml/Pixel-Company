// Web Audio 8-bit synthesizer for retro sound effects without external files

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioEnabled(): boolean {
  return soundEnabled;
}

export function toggleAudio(enable?: boolean): boolean {
  if (enable !== undefined) {
    soundEnabled = enable;
  } else {
    soundEnabled = !soundEnabled;
  }
  return soundEnabled;
}

export function play8BitTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio errors
  }
}

export function playHandoverSound() {
  if (!soundEnabled) return;
  try {
    play8BitTone(523.25, 'square', 0.08, 0.08); // C5
    setTimeout(() => {
      play8BitTone(783.99, 'square', 0.15, 0.1); // G5
    }, 70);
  } catch {}
}

export function playTypingSound() {
  if (!soundEnabled) return;
  try {
    const freqs = [320, 380, 420, 480];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];
    play8BitTone(freq, 'triangle', 0.03, 0.03);
  } catch {}
}

export function playCompleteFanfare() {
  if (!soundEnabled) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        play8BitTone(freq, 'square', 0.18, 0.12);
      }, idx * 100);
    });
  } catch {}
}

export function playRevisionAlert() {
  if (!soundEnabled) return;
  try {
    play8BitTone(440, 'sawtooth', 0.12, 0.1);
    setTimeout(() => {
      play8BitTone(330, 'sawtooth', 0.2, 0.12);
    }, 110);
  } catch {}
}

export function playClickSound() {
  if (!soundEnabled) return;
  try {
    play8BitTone(900, 'sine', 0.04, 0.05);
  } catch {}
}
