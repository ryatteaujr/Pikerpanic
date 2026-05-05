export interface MezzanineBodySpec {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface MezzanineRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MEZZANINE_COLLISION = {
  player: {
    body: { width: 22, height: 42, offsetX: -11, offsetY: -24 },
    spawnPadding: 24,
  },
  hazard: {
    body: { width: 34, height: 24, offsetX: -17, offsetY: -12 },
    spawnGap: 10,
  },
  worker: {
    body: { width: 18, height: 34, offsetX: -9, offsetY: -30 },
    spawnGap: 6,
    zone: {
      height: 64,
      yOffset: -8,
      collides: false,
    },
  },
} as const;

export function getBodyWorldRect(x: number, y: number, body: MezzanineBodySpec): MezzanineRect {
  return {
    x: x + body.offsetX,
    y: y + body.offsetY,
    width: body.width,
    height: body.height,
  };
}

export function inflateRect(rect: MezzanineRect, amount: number): MezzanineRect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2,
  };
}

export function getSpawnClearance(spawn: { x: number; y: number }): MezzanineRect {
  return inflateRect(getBodyWorldRect(spawn.x, spawn.y, MEZZANINE_COLLISION.player.body), MEZZANINE_COLLISION.player.spawnPadding);
}

export function rectsOverlap(a: MezzanineRect, b: MezzanineRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function resolveSpawnSafeX({
  x,
  y,
  body,
  blockedArea,
  minX,
  maxX,
  gap,
}: {
  x: number;
  y: number;
  body: MezzanineBodySpec;
  blockedArea: MezzanineRect;
  minX: number;
  maxX: number;
  gap: number;
}): number {
  if (!rectsOverlap(getBodyWorldRect(x, y, body), blockedArea)) {
    return x;
  }

  const candidates = [
    blockedArea.x + blockedArea.width + gap - body.offsetX,
    blockedArea.x - gap - body.width - body.offsetX,
  ]
    .filter((candidate) => candidate >= minX && candidate <= maxX)
    .filter((candidate) => !rectsOverlap(getBodyWorldRect(candidate, y, body), blockedArea))
    .sort((a, b) => Math.abs(a - x) - Math.abs(b - x));

  return candidates[0] ?? x;
}
