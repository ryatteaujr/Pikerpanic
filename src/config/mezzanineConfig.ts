export interface MezzaninePlatform {
  x: number;
  y: number;
  width: number;
  slope?: 'up' | 'down';
}

export interface MezzanineLadder {
  x: number;
  y: number;
  height: number;
}

export interface MezzanineCollectible {
  x: number;
  y: number;
  label: string;
}

export interface MezzanineHazard {
  x: number;
  y: number;
  vx: number;
  label: string;
}

export interface MezzaninePedestrian {
  x: number;
  y: number;
  left: number;
  right: number;
}

export interface MezzanineLevelConfig {
  level: number;
  name: string;
  timerSeconds: number;
  goal: { x: number; y: number; label: string };
  spawn: { x: number; y: number };
  musicKeys: string[];
  platforms: MezzaninePlatform[];
  ladders: MezzanineLadder[];
  collectibles: MezzanineCollectible[];
  hazards: MezzanineHazard[];
  pedestrians: MezzaninePedestrian[];
}

export const mezzanineLevels = [
  {
    level: 4,
    name: 'Hard Goods Climb',
    timerSeconds: 100,
    spawn: { x: 92, y: 552 },
    goal: { x: 835, y: 146, label: 'MEZZANINE EXIT' },
    musicKeys: ['music-steel-beam-ascent'],
    platforms: [
      { x: 480, y: 584, width: 850 },
      { x: 274, y: 438, width: 300 },
      { x: 650, y: 438, width: 360 },
      { x: 438, y: 306, width: 330 },
      { x: 724, y: 210, width: 300 },
    ],
    ladders: [
      { x: 206, y: 506, height: 136 },
      { x: 394, y: 374, height: 132 },
      { x: 610, y: 260, height: 112 },
    ],
    collectibles: [
      { x: 286, y: 404, label: 'TOOLS' },
      { x: 506, y: 272, label: 'PAINT' },
      { x: 792, y: 404, label: 'BOX' },
      { x: 722, y: 174, label: 'PIPE' },
    ],
    hazards: [
      { x: 790, y: 182, vx: -90, label: 'HEAVY' },
      { x: 598, y: 410, vx: -120, label: 'BOX' },
    ],
    pedestrians: [
      { x: 610, y: 552, left: 560, right: 880 },
    ],
  },
  {
    level: 5,
    name: 'Ramp Runaway',
    timerSeconds: 95,
    spawn: { x: 82, y: 552 },
    goal: { x: 830, y: 110, label: 'BULK SAVINGS' },
    musicKeys: ['music-watch-your-step'],
    platforms: [
      { x: 480, y: 584, width: 850 },
      { x: 710, y: 472, width: 330, slope: 'up' },
      { x: 248, y: 386, width: 330 },
      { x: 606, y: 300, width: 390, slope: 'down' },
      { x: 750, y: 176, width: 300 },
    ],
    ladders: [
      { x: 188, y: 488, height: 184 },
      { x: 424, y: 344, height: 96 },
      { x: 782, y: 238, height: 126 },
    ],
    collectibles: [
      { x: 220, y: 350, label: 'ELEC' },
      { x: 560, y: 264, label: 'PLUMB' },
      { x: 738, y: 140, label: 'HVAC' },
      { x: 610, y: 548, label: 'BOX' },
      { x: 820, y: 548, label: 'FRAGILE' },
    ],
    hazards: [
      { x: 820, y: 148, vx: -130, label: 'WTR' },
      { x: 734, y: 444, vx: -150, label: 'BOX' },
      { x: 520, y: 272, vx: 110, label: 'PIPE' },
    ],
    pedestrians: [
      { x: 368, y: 552, left: 300, right: 460 },
      { x: 602, y: 272, left: 540, right: 710 },
    ],
  },
  {
    level: 6,
    name: 'Mezzanine Mayhem',
    timerSeconds: 90,
    spawn: { x: 74, y: 552 },
    goal: { x: 850, y: 92, label: 'FINAL CHUTE' },
    musicKeys: ['music-top-score-hazard'],
    platforms: [
      { x: 480, y: 584, width: 850 },
      { x: 300, y: 470, width: 350, slope: 'down' },
      { x: 662, y: 372, width: 390, slope: 'up' },
      { x: 304, y: 280, width: 380 },
      { x: 708, y: 180, width: 360 },
      { x: 500, y: 108, width: 240 },
    ],
    ladders: [
      { x: 178, y: 526, height: 116 },
      { x: 448, y: 420, height: 112 },
      { x: 692, y: 276, height: 190 },
      { x: 530, y: 184, height: 148 },
    ],
    collectibles: [
      { x: 318, y: 434, label: 'TOOLS' },
      { x: 694, y: 336, label: 'PIPE' },
      { x: 260, y: 244, label: 'PAINT' },
      { x: 718, y: 144, label: 'WTR' },
      { x: 500, y: 72, label: 'KEY' },
    ],
    hazards: [
      { x: 770, y: 150, vx: -165, label: 'HEAVY' },
      { x: 640, y: 344, vx: -155, label: 'BOX' },
      { x: 254, y: 252, vx: 145, label: 'PIPE' },
      { x: 500, y: 80, vx: 120, label: 'BOSS' },
    ],
    pedestrians: [
      { x: 252, y: 552, left: 200, right: 360 },
      { x: 600, y: 344, left: 520, right: 720 },
      { x: 288, y: 252, left: 210, right: 400 },
    ],
  },
] satisfies MezzanineLevelConfig[];

export function getMezzanineLevelConfig(level: number): MezzanineLevelConfig | null {
  return mezzanineLevels.find((config) => config.level === level) ?? null;
}

export function isMezzanineLevel(level: number): boolean {
  return getMezzanineLevelConfig(level) !== null;
}
