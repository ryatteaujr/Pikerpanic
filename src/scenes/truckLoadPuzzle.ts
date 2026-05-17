export interface GridCell {
  color: number;
  label: string;
}

export type TruckLoadGrid = Array<Array<GridCell | null>>;

export interface CargoCell {
  x: number;
  y: number;
}

export interface TruckLoadPiece {
  id: string;
  label: string;
  color: number;
  cells: CargoCell[];
}

export const truckLoadPieces: TruckLoadPiece[] = [
  { id: 'box-o', label: 'BOX', color: 0xd99032, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { id: 'crate-i', label: 'CRATE', color: 0x2f74d8, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] },
  { id: 'fragile-l', label: 'FRAG', color: 0xd94d6a, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },
  { id: 'pallet-t', label: 'PAL', color: 0xb77935, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }] },
  { id: 'carton-s', label: 'CTN', color: 0x68a63f, cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { id: 'long-z', label: 'PIPE', color: 0xf0c44c, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
];

export function createTruckLoadGrid(width: number, height: number): TruckLoadGrid {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => null));
}

export function getPieceCells(piece: TruckLoadPiece, x: number, y: number): CargoCell[] {
  return piece.cells.map((cell) => ({ x: x + cell.x, y: y + cell.y }));
}

export function rotatePiece(piece: TruckLoadPiece): TruckLoadPiece {
  const rotated = piece.cells.map((cell) => ({ x: -cell.y, y: cell.x }));
  const minX = Math.min(...rotated.map((cell) => cell.x));
  const minY = Math.min(...rotated.map((cell) => cell.y));

  return {
    ...piece,
    cells: rotated.map((cell) => ({ x: cell.x - minX, y: cell.y - minY })),
  };
}

export function canPlacePiece(grid: TruckLoadGrid, piece: TruckLoadPiece, x: number, y: number): boolean {
  return getPieceCells(piece, x, y).every((cell) => (
    cell.x >= 0 &&
    cell.x < grid[0].length &&
    cell.y >= 0 &&
    cell.y < grid.length &&
    !grid[cell.y][cell.x]
  ));
}

export function mergePiece(grid: TruckLoadGrid, piece: TruckLoadPiece, x: number, y: number): TruckLoadGrid {
  const next = grid.map((row) => [...row]);
  for (const cell of getPieceCells(piece, x, y)) {
    if (cell.y >= 0 && cell.y < next.length && cell.x >= 0 && cell.x < next[0].length) {
      next[cell.y][cell.x] = { color: piece.color, label: piece.label };
    }
  }
  return next;
}

export function clearFullCargoRows(grid: TruckLoadGrid): { grid: TruckLoadGrid; cleared: number } {
  const remaining = grid.filter((row) => row.some((cell) => !cell));
  const cleared = grid.length - remaining.length;
  const emptyRows = Array.from({ length: cleared }, () => Array.from({ length: grid[0].length }, () => null));

  return { grid: [...emptyRows, ...remaining], cleared };
}

export function getHardDropY(grid: TruckLoadGrid, piece: TruckLoadPiece, x: number, y: number): number {
  let dropY = y;
  while (canPlacePiece(grid, piece, x, dropY + 1)) {
    dropY += 1;
  }
  return dropY;
}

export function getCargoFillPercent(grid: TruckLoadGrid): number {
  const total = grid.length * grid[0].length;
  const filled = grid.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
  return Math.round((filled / total) * 100);
}
