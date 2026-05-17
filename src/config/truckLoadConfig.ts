export interface TruckLoadLevelConfig {
  level: number;
  name: string;
  subtitle: string;
  timerSeconds: number;
  width: number;
  height: number;
  targetLines: number;
  fallDelayMs: number;
  musicKeys: string[];
}

export const truckLoadLevels = [
  {
    level: 10,
    name: 'Truck Load',
    subtitle: 'Stack clean cargo rows.',
    timerSeconds: 120,
    width: 10,
    height: 14,
    targetLines: 4,
    fallDelayMs: 760,
    musicKeys: ['music-the-loading-dock'],
  },
  {
    level: 11,
    name: 'Fragile Freight Fit',
    subtitle: 'Keep awkward cargo tight.',
    timerSeconds: 110,
    width: 10,
    height: 14,
    targetLines: 6,
    fallDelayMs: 640,
    musicKeys: ['music-loading-bay-protocol'],
  },
  {
    level: 12,
    name: 'High-Capacity Load',
    subtitle: 'Finish the trailer clean.',
    timerSeconds: 100,
    width: 10,
    height: 14,
    targetLines: 8,
    fallDelayMs: 540,
    musicKeys: ['music-final-gate-opening'],
  },
] satisfies TruckLoadLevelConfig[];

export function getTruckLoadLevelConfig(level: number): TruckLoadLevelConfig | null {
  return truckLoadLevels.find((config) => config.level === level) ?? null;
}

export function isTruckLoadLevel(level: number): boolean {
  return getTruckLoadLevelConfig(level) !== null;
}
