import { beforeEach, describe, expect, it } from "vitest";
import { assertValidGridSize, clampGridSize, GRID_MAX, GRID_MIN, Grid } from "./grid";

describe("clampGridSize", () => {
  it("clamps below minimum to 8", () => {
    expect(clampGridSize(1)).toBe(8);
    expect(clampGridSize(0)).toBe(8);
    expect(clampGridSize(-5)).toBe(8);
  });

  it("clamps above maximum to 128", () => {
    expect(clampGridSize(200)).toBe(128);
    expect(clampGridSize(129)).toBe(128);
  });

  it("passes through valid values", () => {
    expect(clampGridSize(8)).toBe(8);
    expect(clampGridSize(64)).toBe(64);
    expect(clampGridSize(128)).toBe(128);
  });
});

describe("assertValidGridSize", () => {
  it("throws for N below 8", () => {
    expect(() => assertValidGridSize(7)).toThrow(RangeError);
    expect(() => assertValidGridSize(0)).toThrow(RangeError);
  });

  it("throws for N above 128", () => {
    expect(() => assertValidGridSize(129)).toThrow(RangeError);
  });

  it("throws for non-integer N", () => {
    expect(() => assertValidGridSize(16.5)).toThrow(RangeError);
  });

  it("does not throw for valid N", () => {
    expect(() => assertValidGridSize(8)).not.toThrow();
    expect(() => assertValidGridSize(64)).not.toThrow();
    expect(() => assertValidGridSize(128)).not.toThrow();
  });
});

describe("Grid", () => {
  let grid: Grid;
  const LAYER_A = "layer-a";
  const LAYER_B = "layer-b";

  beforeEach(() => {
    grid = new Grid(16);
  });

  it("can be initialized with any integer N from 8 to 128", () => {
    for (const n of [8, 16, 32, 64, 128]) {
      const g = new Grid(n);
      expect(g.n).toBe(n);
    }
  });

  it("rejects N below 8", () => {
    expect(() => new Grid(7)).toThrow(RangeError);
    expect(() => new Grid(1)).toThrow(RangeError);
  });

  it("rejects N above 128", () => {
    expect(() => new Grid(129)).toThrow(RangeError);
    expect(() => new Grid(256)).toThrow(RangeError);
  });

  it("returns the current N via .n", () => {
    expect(grid.n).toBe(16);
    const g2 = new Grid(32);
    expect(g2.n).toBe(32);
  });

  it("returns an empty cell by default", () => {
    const cell = grid.getCell(LAYER_A, 0, 0);
    expect(cell.filled).toBe(false);
    expect(cell.color).toBeUndefined();
  });

  it("can set and query fill state and color on a layer", () => {
    grid.fillCell(LAYER_A, 3, 5, "#ff0000");
    const cell = grid.getCell(LAYER_A, 3, 5);
    expect(cell.filled).toBe(true);
    expect(cell.color).toBe("#ff0000");
  });

  it("erasing a cell sets it to empty", () => {
    grid.fillCell(LAYER_A, 2, 2, "#00ff00");
    grid.eraseCell(LAYER_A, 2, 2);
    const cell = grid.getCell(LAYER_A, 2, 2);
    expect(cell.filled).toBe(false);
    expect(cell.color).toBeUndefined();
  });

  it("setting a cell on one layer does not affect another layer", () => {
    grid.fillCell(LAYER_A, 0, 0, "#ff0000");
    const cellOnB = grid.getCell(LAYER_B, 0, 0);
    expect(cellOnB.filled).toBe(false);
    expect(cellOnB.color).toBeUndefined();
  });

  it("layers maintain independent cell states", () => {
    grid.fillCell(LAYER_A, 4, 4, "#ff0000");
    grid.fillCell(LAYER_B, 4, 4, "#0000ff");
    expect(grid.getCell(LAYER_A, 4, 4).color).toBe("#ff0000");
    expect(grid.getCell(LAYER_B, 4, 4).color).toBe("#0000ff");
  });

  it("erasing on one layer does not affect another layer", () => {
    grid.fillCell(LAYER_A, 1, 1, "#ff0000");
    grid.fillCell(LAYER_B, 1, 1, "#0000ff");
    grid.eraseCell(LAYER_A, 1, 1);
    expect(grid.getCell(LAYER_A, 1, 1).filled).toBe(false);
    expect(grid.getCell(LAYER_B, 1, 1).filled).toBe(true);
    expect(grid.getCell(LAYER_B, 1, 1).color).toBe("#0000ff");
  });

  it("throws when accessing a cell out of bounds", () => {
    expect(() => grid.getCell(LAYER_A, -1, 0)).toThrow(RangeError);
    expect(() => grid.getCell(LAYER_A, 16, 0)).toThrow(RangeError);
    expect(() => grid.getCell(LAYER_A, 0, 16)).toThrow(RangeError);
  });

  it("resize updates N and rejects invalid sizes", () => {
    grid.resize(32);
    expect(grid.n).toBe(32);
    expect(() => grid.resize(7)).toThrow(RangeError);
    expect(() => grid.resize(129)).toThrow(RangeError);
  });

  it("GRID_MIN is 8 and GRID_MAX is 128", () => {
    expect(GRID_MIN).toBe(8);
    expect(GRID_MAX).toBe(128);
  });

  it("getLayerCells returns flat array of correct size", () => {
    grid.fillCell(LAYER_A, 0, 0, "#ff0000");
    const cells = grid.getLayerCells(LAYER_A);
    expect(cells.length).toBe(16 * 16);
    expect(cells[0]!.filled).toBe(true);
    expect(cells[0]!.color).toBe("#ff0000");
    expect(cells[1]!.filled).toBe(false);
  });
});
