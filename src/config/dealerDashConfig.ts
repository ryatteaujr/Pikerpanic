export interface DealerStop {
  x: number;
  y: number;
  name: string;
  cargo: string;
  color: number;
  bonusSeconds: number;
  score: number;
}

export interface DealerTraffic {
  x: number;
  y: number;
  minX: number;
  maxX: number;
  speed: number;
  color: number;
  label: string;
}

export interface RoadHazard {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface DealerDashLevelConfig {
  level: number;
  name: string;
  subtitle: string;
  timerSeconds: number;
  damageLimit: number;
  truckSpawn: { x: number; y: number };
  dealerStops: DealerStop[];
  traffic: DealerTraffic[];
  hazards: RoadHazard[];
  musicKeys: string[];
}

export const dealerDashLevels = [
  {
    level: 13,
    name: 'Dealer-Dash',
    subtitle: 'Deliver fast. Dock clean.',
    timerSeconds: 135,
    damageLimit: 100,
    truckSpawn: { x: 120, y: 500 },
    musicKeys: ['music-the-loading-dock', 'music-loading-bay-protocol', 'music-final-gate-opening'],
    dealerStops: [
      {
        x: 792,
        y: 136,
        name: 'Miller Hardware',
        cargo: 'Paint + Tools',
        color: 0xf0c44c,
        bonusSeconds: 14,
        score: 2500,
      },
      {
        x: 142,
        y: 136,
        name: 'Valley Supply',
        cargo: 'Ladders',
        color: 0x8dffb1,
        bonusSeconds: 12,
        score: 2200,
      },
      {
        x: 772,
        y: 500,
        name: 'Main St Hardware',
        cargo: 'Plumbing',
        color: 0x6fd2ff,
        bonusSeconds: 16,
        score: 3000,
      },
    ],
    traffic: [
      { x: 430, y: 232, minX: 260, maxX: 700, speed: 88, color: 0xd94d49, label: 'CAR' },
      { x: 650, y: 282, minX: 315, maxX: 770, speed: -76, color: 0x5ec8ff, label: 'VAN' },
      { x: 300, y: 374, minX: 180, maxX: 560, speed: 94, color: 0xf2c94c, label: 'BUS' },
      { x: 610, y: 466, minX: 360, maxX: 800, speed: -82, color: 0x9b7cff, label: 'PICKUP' },
    ],
    hazards: [
      { x: 472, y: 236, width: 74, height: 32, label: 'ROAD WORK' },
      { x: 574, y: 538, width: 86, height: 28, label: 'TIGHT TURN' },
      { x: 276, y: 314, width: 64, height: 30, label: 'GRAVEL' },
    ],
  },
] satisfies DealerDashLevelConfig[];

export function getDealerDashLevelConfig(level: number): DealerDashLevelConfig | null {
  return dealerDashLevels.find((config) => config.level === level) ?? null;
}

export function isDealerDashLevel(level: number): boolean {
  return getDealerDashLevelConfig(level) !== null;
}
