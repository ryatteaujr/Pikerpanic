export interface FinaleConveyor {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: -1 | 1;
  speed: number;
  vx: number;
  label: string;
}

export interface FinaleDockTarget {
  x: number;
  y: number;
  label: string;
}

export interface FinalePackage {
  x: number;
  y: number;
  label: string;
  value: number;
}

export interface FinaleHazard {
  x: number;
  y: number;
  speed: number;
  left: number;
  right: number;
  vx: number;
  minX: number;
  maxX: number;
  label: string;
}

export interface FinaleWorker {
  x: number;
  y: number;
  speed: number;
  left: number;
  right: number;
}

export interface FinaleLevelConfig {
  level: number;
  name: string;
  timerSeconds: number;
  loadGoal: number;
  targetLabel: string;
  spawn: { x: number; y: number };
  musicKeys: string[];
  conveyors: FinaleConveyor[];
  dockTargets: FinaleDockTarget[];
  packages: FinalePackage[];
  hazards: FinaleHazard[];
  workers: FinaleWorker[];
}

export const finaleLevels = [
  {
    level: 7,
    name: 'Conveyor Belt Sort',
    timerSeconds: 95,
    loadGoal: 6,
    targetLabel: 'DOCK SORT',
    spawn: { x: 112, y: 520 },
    musicKeys: ['music-the-loading-dock'],
    conveyors: [
      { x: 430, y: 210, width: 590, height: 42, direction: 1, speed: 42, vx: 42, label: 'SORT A' },
      { x: 430, y: 330, width: 590, height: 42, direction: -1, speed: 36, vx: -36, label: 'SORT B' },
      { x: 430, y: 450, width: 590, height: 42, direction: 1, speed: 44, vx: 44, label: 'SORT C' },
    ],
    dockTargets: [
      { x: 804, y: 210, label: 'DOCK 7A' },
      { x: 804, y: 450, label: 'DOCK 7C' },
    ],
    packages: [
      { x: 220, y: 210, label: 'A1', value: 150 },
      { x: 420, y: 210, label: 'A2', value: 150 },
      { x: 310, y: 330, label: 'B1', value: 175 },
      { x: 560, y: 330, label: 'B2', value: 175 },
      { x: 250, y: 450, label: 'C1', value: 150 },
      { x: 540, y: 450, label: 'C2', value: 150 },
    ],
    hazards: [
      { x: 610, y: 268, speed: 92, left: 310, right: 720, vx: 92, minX: 310, maxX: 720, label: 'PALLET' },
      { x: 360, y: 390, speed: -86, left: 210, right: 680, vx: -86, minX: 210, maxX: 680, label: 'JACK' },
    ],
    workers: [
      { x: 690, y: 528, speed: 72, left: 600, right: 780 },
    ],
  },
  {
    level: 8,
    name: 'Loading Dock Rush',
    timerSeconds: 90,
    loadGoal: 8,
    targetLabel: 'RUSH BAY',
    spawn: { x: 100, y: 520 },
    musicKeys: ['music-loading-bay-protocol'],
    conveyors: [
      { x: 420, y: 186, width: 610, height: 40, direction: 1, speed: 50, vx: 50, label: 'FAST A' },
      { x: 420, y: 300, width: 610, height: 40, direction: -1, speed: 48, vx: -48, label: 'RETURN' },
      { x: 420, y: 414, width: 610, height: 40, direction: 1, speed: 54, vx: 54, label: 'FAST C' },
      { x: 420, y: 520, width: 610, height: 40, direction: -1, speed: 44, vx: -44, label: 'STAGE' },
    ],
    dockTargets: [
      { x: 806, y: 186, label: 'BAY 8A' },
      { x: 806, y: 414, label: 'BAY 8C' },
      { x: 806, y: 520, label: 'BAY 8D' },
    ],
    packages: [
      { x: 210, y: 186, label: 'A1', value: 175 },
      { x: 390, y: 186, label: 'A2', value: 175 },
      { x: 590, y: 186, label: 'A3', value: 175 },
      { x: 270, y: 300, label: 'B1', value: 200 },
      { x: 500, y: 300, label: 'B2', value: 200 },
      { x: 220, y: 414, label: 'C1', value: 175 },
      { x: 470, y: 414, label: 'C2', value: 175 },
      { x: 610, y: 520, label: 'D1', value: 225 },
    ],
    hazards: [
      { x: 640, y: 246, speed: 118, left: 280, right: 730, vx: 118, minX: 280, maxX: 730, label: 'FORK' },
      { x: 330, y: 360, speed: -104, left: 190, right: 710, vx: -104, minX: 190, maxX: 710, label: 'JACK' },
      { x: 580, y: 476, speed: 96, left: 300, right: 740, vx: 96, minX: 300, maxX: 740, label: 'LOAD' },
    ],
    workers: [
      { x: 675, y: 128, speed: 82, left: 560, right: 790 },
      { x: 500, y: 568, speed: -78, left: 390, right: 650 },
    ],
  },
  {
    level: 9,
    name: 'Final Truck Load Panic',
    timerSeconds: 85,
    loadGoal: 10,
    targetLabel: 'FINAL TRUCK',
    spawn: { x: 94, y: 526 },
    musicKeys: ['music-final-gate-opening'],
    conveyors: [
      { x: 420, y: 166, width: 620, height: 38, direction: 1, speed: 58, vx: 58, label: 'FINAL A' },
      { x: 420, y: 272, width: 620, height: 38, direction: -1, speed: 58, vx: -58, label: 'FINAL B' },
      { x: 420, y: 378, width: 620, height: 38, direction: 1, speed: 62, vx: 62, label: 'FINAL C' },
      { x: 420, y: 492, width: 620, height: 38, direction: -1, speed: 52, vx: -52, label: 'FINAL D' },
    ],
    dockTargets: [
      { x: 812, y: 166, label: 'TRUCK 9A' },
      { x: 812, y: 272, label: 'TRUCK 9B' },
      { x: 812, y: 378, label: 'TRUCK 9C' },
      { x: 812, y: 492, label: 'TRUCK 9D' },
    ],
    packages: [
      { x: 205, y: 166, label: 'A1', value: 200 },
      { x: 380, y: 166, label: 'A2', value: 200 },
      { x: 590, y: 166, label: 'A3', value: 200 },
      { x: 235, y: 272, label: 'B1', value: 225 },
      { x: 455, y: 272, label: 'B2', value: 225 },
      { x: 650, y: 272, label: 'B3', value: 225 },
      { x: 220, y: 378, label: 'C1', value: 225 },
      { x: 510, y: 378, label: 'C2', value: 225 },
      { x: 310, y: 492, label: 'D1', value: 250 },
      { x: 610, y: 492, label: 'D2', value: 250 },
    ],
    hazards: [
      { x: 650, y: 220, speed: 132, left: 260, right: 740, vx: 132, minX: 260, maxX: 740, label: 'FORK' },
      { x: 300, y: 326, speed: -126, left: 190, right: 720, vx: -126, minX: 190, maxX: 720, label: 'JACK' },
      { x: 585, y: 438, speed: 118, left: 260, right: 760, vx: 118, minX: 260, maxX: 760, label: 'LOAD' },
      { x: 430, y: 552, speed: -112, left: 220, right: 690, vx: -112, minX: 220, maxX: 690, label: 'FINAL' },
    ],
    workers: [
      { x: 680, y: 112, speed: 92, left: 560, right: 800 },
      { x: 515, y: 326, speed: -86, left: 410, right: 620 },
      { x: 515, y: 566, speed: 88, left: 360, right: 680 },
    ],
  },
] satisfies FinaleLevelConfig[];

export function getFinaleLevelConfig(level: number): FinaleLevelConfig | null {
  return finaleLevels.find((config) => config.level === level) ?? null;
}

export function isFinaleLevel(level: number): boolean {
  return getFinaleLevelConfig(level) !== null;
}
