export const startLevelOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

export interface StartLevelStage {
  stage: number;
  levels: number[];
  rangeLabel: string;
  title: string;
  description: string;
}

export const startLevelStages: StartLevelStage[] = [
  {
    stage: 1,
    levels: [1, 2, 3],
    rangeLabel: 'LEVELS 01-03',
    title: 'WAREHOUSE PICK',
    description: 'Pick tickets, dodge forklifts, unload chutes.',
  },
  {
    stage: 2,
    levels: [4, 5, 6],
    rangeLabel: 'LEVELS 04-06',
    title: 'MEZZANINE CLIMB',
    description: 'Collect hard goods while climbing platforms.',
  },
  {
    stage: 3,
    levels: [7, 8, 9],
    rangeLabel: 'LEVELS 07-09',
    title: 'LOADING DOCK',
    description: 'Grab freight and load the dock bays.',
  },
  {
    stage: 4,
    levels: [10, 11, 12],
    rangeLabel: 'LEVELS 10-12',
    title: 'TRUCK LOAD',
    description: 'Stack cargo puzzle pieces into clean rows.',
  },
  {
    stage: 5,
    levels: [13],
    rangeLabel: 'LEVEL 13',
    title: 'DEALER DASH',
    description: 'Drive the loaded truck through traffic.',
  },
];

const numberKeyLevels: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  ZERO: 10,
};

export function moveSelectedStartLevel(currentLevel: number, direction: -1 | 1): number {
  const currentIndex = startLevelOptions.indexOf(currentLevel as (typeof startLevelOptions)[number]);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = (safeIndex + direction + startLevelOptions.length) % startLevelOptions.length;

  return startLevelOptions[nextIndex];
}

export function getLevelFromNumberKey(key: string): number | null {
  return numberKeyLevels[key] ?? null;
}

export function getStartLevelStage(level: number): StartLevelStage | null {
  return startLevelStages.find((stage) => stage.levels.includes(level)) ?? null;
}

export function getStageStartLevel(stageNumber: number): number | null {
  const stage = startLevelStages.find((candidate) => candidate.stage === stageNumber);

  return stage?.levels[0] ?? null;
}

export function moveSelectedStage(currentLevel: number, direction: -1 | 1): number {
  const currentStage = getStartLevelStage(currentLevel) ?? startLevelStages[0];
  const currentIndex = startLevelStages.findIndex((stage) => stage.stage === currentStage.stage);
  const nextIndex = (currentIndex + direction + startLevelStages.length) % startLevelStages.length;

  return startLevelStages[nextIndex].levels[0];
}

export function getCoinMenuStageLines(selectedLevel: number): string[] {
  const selectedStage = getStartLevelStage(selectedLevel);

  return startLevelStages.map((stage) => {
    const marker = stage.stage === selectedStage?.stage ? '>' : ' ';
    return `${marker} STAGE ${stage.stage}  ${stage.rangeLabel}  ${stage.title} - ${stage.description}`;
  });
}
