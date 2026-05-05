export type TicketItemType = 'Hammers' | 'Tape' | 'Drill Bits' | 'Fragile' | 'Water Heater' | 'Freezer Pack';

export interface RequiredTicketLine {
  type: TicketItemType;
  quantity: number;
}

export interface TicketItemPlacement {
  x: number;
  y: number;
  type: TicketItemType;
}

export interface PatrolConfig {
  points: Array<{ x: number; y: number }>;
}

export interface PedestrianConfig {
  x: number;
  y: number;
  area: { x: number; y: number; width: number; height: number };
}

export interface WarehouseLevelConfig {
  level: number;
  name: string;
  width: number;
  height: number;
  hudHeight: number;
  timerSeconds: number;
  lives: number;
  chute: string;
  chutePosition: { x: number; y: number };
  coldChute?: { id: string; x: number; y: number };
  ticketNumber: string;
  musicKeys: string[];
  forklifts: PatrolConfig[];
  pedestrians: PedestrianConfig[];
  requiredItems: RequiredTicketLine[];
  ticketItems: TicketItemPlacement[];
}

export const levelConfigs = [
  {
    level: 1,
    name: 'Day Shift',
    width: 960,
    height: 640,
    hudHeight: 104,
    timerSeconds: 300,
    lives: 3,
    chute: '06',
    chutePosition: { x: 736, y: 538 },
    ticketNumber: '7824',
    musicKeys: ['music-expedite-load', 'music-schedule-failure', 'music-priority-override'],
    forklifts: [
      {
        points: [
          { x: 356, y: 238 },
          { x: 356, y: 510 },
          { x: 590, y: 510 },
          { x: 590, y: 238 },
        ],
      },
    ],
    pedestrians: [],
    requiredItems: [
      { type: 'Hammers', quantity: 3 },
      { type: 'Tape', quantity: 2 },
      { type: 'Drill Bits', quantity: 1 },
    ],
    ticketItems: [
      { x: 184, y: 154, type: 'Hammers' },
      { x: 184, y: 456, type: 'Hammers' },
      { x: 770, y: 154, type: 'Hammers' },
      { x: 356, y: 254, type: 'Tape' },
      { x: 770, y: 382, type: 'Tape' },
      { x: 590, y: 456, type: 'Drill Bits' },
    ],
  },
  {
    level: 2,
    name: 'Bulk Rush',
    width: 960,
    height: 640,
    hudHeight: 104,
    timerSeconds: 300,
    lives: 3,
    chute: '12',
    chutePosition: { x: 206, y: 238 },
    ticketNumber: '9137',
    musicKeys: ['music-warehouse-gridlock', 'music-loading-bay-breach', 'music-final-boss-sprint'],
    forklifts: [
      {
        points: [
          { x: 356, y: 238 },
          { x: 356, y: 510 },
          { x: 590, y: 510 },
          { x: 590, y: 238 },
        ],
      },
    ],
    pedestrians: [],
    requiredItems: [
      { type: 'Hammers', quantity: 3 },
      { type: 'Tape', quantity: 2 },
      { type: 'Drill Bits', quantity: 2 },
      { type: 'Fragile', quantity: 1 },
      { type: 'Water Heater', quantity: 1 },
    ],
    ticketItems: [
      { x: 184, y: 154, type: 'Hammers' },
      { x: 184, y: 456, type: 'Hammers' },
      { x: 770, y: 154, type: 'Hammers' },
      { x: 356, y: 254, type: 'Tape' },
      { x: 770, y: 382, type: 'Tape' },
      { x: 590, y: 456, type: 'Drill Bits' },
      { x: 332, y: 382, type: 'Drill Bits' },
      { x: 590, y: 154, type: 'Fragile' },
      { x: 704, y: 520, type: 'Water Heater' },
    ],
  },
  {
    level: 3,
    name: 'Cold Chain Chaos',
    width: 960,
    height: 640,
    hudHeight: 104,
    timerSeconds: 300,
    lives: 3,
    chute: '12',
    chutePosition: { x: 206, y: 238 },
    coldChute: { id: '03', x: 736, y: 238 },
    ticketNumber: '1043',
    musicKeys: ['music-warehouse-gridlock', 'music-loading-bay-breach', 'music-final-boss-sprint'],
    forklifts: [
      {
        points: [
          { x: 356, y: 238 },
          { x: 356, y: 510 },
          { x: 590, y: 510 },
          { x: 590, y: 238 },
        ],
      },
      {
        points: [
          { x: 688, y: 238 },
          { x: 778, y: 238 },
          { x: 778, y: 386 },
          { x: 688, y: 386 },
        ],
      },
    ],
    pedestrians: [
      { x: 258, y: 250, area: { x: 228, y: 218, width: 62, height: 64 } },
      { x: 516, y: 390, area: { x: 488, y: 356, width: 66, height: 68 } },
      { x: 704, y: 478, area: { x: 674, y: 450, width: 70, height: 56 } },
    ],
    requiredItems: [
      { type: 'Hammers', quantity: 2 },
      { type: 'Tape', quantity: 2 },
      { type: 'Drill Bits', quantity: 2 },
      { type: 'Fragile', quantity: 1 },
      { type: 'Water Heater', quantity: 1 },
      { type: 'Freezer Pack', quantity: 2 },
    ],
    ticketItems: [
      { x: 184, y: 154, type: 'Hammers' },
      { x: 770, y: 154, type: 'Hammers' },
      { x: 356, y: 254, type: 'Tape' },
      { x: 770, y: 382, type: 'Tape' },
      { x: 590, y: 456, type: 'Drill Bits' },
      { x: 332, y: 382, type: 'Drill Bits' },
      { x: 590, y: 154, type: 'Fragile' },
      { x: 704, y: 520, type: 'Water Heater' },
      { x: 430, y: 520, type: 'Freezer Pack' },
      { x: 770, y: 238, type: 'Freezer Pack' },
    ],
  },
] satisfies WarehouseLevelConfig[];

export const levelConfig = levelConfigs[0];

export function getLevelConfig(level: number): WarehouseLevelConfig {
  return levelConfigs.find((config) => config.level === level) ?? levelConfig;
}

export function getNextLevelNumber(level: number): number | null {
  const levelNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const currentIndex = levelNumbers.indexOf(level);
  return currentIndex === -1 ? null : levelNumbers[currentIndex + 1] ?? null;
}
