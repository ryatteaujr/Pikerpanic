export type SoundEffectKind = 'pickup' | 'dropoff' | 'crash';

export interface SoundEffectStep {
  frequency: number;
  duration: number;
  type: OscillatorType;
}

export interface SoundEffectPlan {
  volume: number;
  steps: SoundEffectStep[];
}

const plans: Record<SoundEffectKind, SoundEffectPlan> = {
  pickup: {
    volume: 0.12,
    steps: [
      { frequency: 740, duration: 0.055, type: 'square' },
      { frequency: 1120, duration: 0.07, type: 'square' },
    ],
  },
  dropoff: {
    volume: 0.16,
    steps: [
      { frequency: 420, duration: 0.06, type: 'triangle' },
      { frequency: 620, duration: 0.07, type: 'triangle' },
      { frequency: 940, duration: 0.11, type: 'triangle' },
    ],
  },
  crash: {
    volume: 0.28,
    steps: [
      { frequency: 160, duration: 0.08, type: 'sawtooth' },
      { frequency: 92, duration: 0.12, type: 'sawtooth' },
      { frequency: 58, duration: 0.18, type: 'square' },
    ],
  },
};

export function getSoundEffectPlan(kind: SoundEffectKind): SoundEffectPlan {
  return plans[kind];
}

export function playSoundEffect(kind: SoundEffectKind): void {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const plan = getSoundEffectPlan(kind);
  let cursor = context.currentTime;

  for (const step of plan.steps) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = step.type;
    oscillator.frequency.setValueAtTime(step.frequency, cursor);
    gain.gain.setValueAtTime(plan.volume, cursor);
    gain.gain.exponentialRampToValueAtTime(0.001, cursor + step.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(cursor);
    oscillator.stop(cursor + step.duration);
    cursor += step.duration;
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
