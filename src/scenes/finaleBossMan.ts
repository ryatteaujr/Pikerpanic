export interface BossManPlacement {
  x: number;
  y: number;
  scale: number;
  depth: number;
}

const LOADING_DOCK_LEVELS = new Set([7, 8, 9]);

export function getBossManPlacement(level: number): BossManPlacement | null {
  if (!LOADING_DOCK_LEVELS.has(level)) {
    return null;
  }

  return {
    x: 888,
    y: 354,
    scale: 0.58,
    depth: 23,
  };
}
