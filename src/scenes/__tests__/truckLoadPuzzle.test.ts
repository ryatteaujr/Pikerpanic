import { describe, expect, it } from 'vitest';
import {
  createTruckLoadGrid,
  getCargoFillPercent,
  getHardDropY,
  getPieceCells,
  mergePiece,
  rotatePiece,
  clearFullCargoRows,
  type TruckLoadPiece,
} from '../truckLoadPuzzle';

describe('truck load puzzle rules', () => {
  const square: TruckLoadPiece = {
    id: 'crate',
    label: 'CRATE',
    color: 0xf0c44c,
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  };

  it('rotates cargo pieces around their local origin', () => {
    const piece: TruckLoadPiece = {
      id: 'corner',
      label: 'L',
      color: 0x68f39a,
      cells: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
    };

    expect(rotatePiece(piece).cells).toEqual([
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ]);
  });

  it('hard-drops pieces to the lowest valid cargo bay position', () => {
    const grid = createTruckLoadGrid(4, 4);

    expect(getHardDropY(grid, square, 1, 0)).toBe(2);
  });

  it('clears full cargo rows and reports cargo fill percent', () => {
    let grid = createTruckLoadGrid(4, 4);
    grid = mergePiece(grid, square, 0, 2);
    grid = mergePiece(grid, square, 2, 2);

    const result = clearFullCargoRows(grid);

    expect(result.cleared).toBe(2);
    expect(getCargoFillPercent(result.grid)).toBe(0);
    expect(getPieceCells(square, 2, 1)).toEqual([
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ]);
  });
});
