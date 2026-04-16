import { describe, expect, it } from "vitest";
import { GRID_MAX, GRID_MIN, Grid } from "../models/grid";
import { LayerManager } from "../models/layers";
import { resizeGrid } from "./resize";

function setup(n: number) {
  const grid = new Grid(n);
  const lm = new LayerManager([
    { id: "l1", name: "Layer 1", visible: true, rotation: 0 },
    { id: "l2", name: "Layer 2", visible: true, rotation: 0 },
  ]);
  grid.initLayer("l1");
  grid.initLayer("l2");
  return { grid, lm };
}

describe("resizeGrid (T-006)", () => {
  it("rejects newN below GRID_MIN", () => {
    const { grid, lm } = setup(16);
    expect(() => resizeGrid(grid, lm, GRID_MIN - 1)).toThrow(RangeError);
  });

  it("rejects newN above GRID_MAX", () => {
    const { grid, lm } = setup(16);
    expect(() => resizeGrid(grid, lm, GRID_MAX + 1)).toThrow(RangeError);
  });

  it("does not mutate the original grid", () => {
    const { grid, lm } = setup(8);
    grid.fillCell("l1", 0, 0, "#ff0000");
    resizeGrid(grid, lm, 16);
    expect(grid.getCell("l1", 0, 0).color).toBe("#ff0000");
    expect(grid.n).toBe(8);
  });

  it("returns a new Grid with the requested dimension", () => {
    const { grid, lm } = setup(8);
    const newGrid = resizeGrid(grid, lm, 16);
    expect(newGrid.n).toBe(16);
  });

  it("scaling up 2x maps nearest neighbor correctly", () => {
    const { grid, lm } = setup(8);
    grid.fillCell("l1", 0, 0, "#red");
    const newGrid = resizeGrid(grid, lm, 16);
    // (0,0) in 8x8 maps to (0,0), (0,1), (1,0), (1,1) in 16x16
    expect(newGrid.getCell("l1", 0, 0).color).toBe("#red");
    expect(newGrid.getCell("l1", 0, 1).color).toBe("#red");
    expect(newGrid.getCell("l1", 1, 0).color).toBe("#red");
    expect(newGrid.getCell("l1", 1, 1).color).toBe("#red");
    // (0,2) maps to src col floor(2/16*8)=1, which is empty
    expect(newGrid.getCell("l1", 0, 2).filled).toBe(false);
  });

  it("scaling down samples data correctly", () => {
    const { grid, lm } = setup(32);
    for (let r = 0; r < 32; r++) {
      for (let c = 0; c < 32; c++) {
        grid.fillCell("l1", r, c, (r + c) % 2 === 0 ? "#000" : "#fff");
      }
    }
    const newGrid = resizeGrid(grid, lm, 8);
    expect(newGrid.n).toBe(8);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = newGrid.getCell("l1", r, c);
        expect(cell.filled).toBe(true);
        expect(cell.color === "#000" || cell.color === "#fff").toBe(true);
      }
    }
  });

  it("resizes all layers together", () => {
    const { grid, lm } = setup(8);
    grid.fillCell("l1", 0, 0, "#aaa");
    grid.fillCell("l2", 7, 7, "#bbb");
    const newGrid = resizeGrid(grid, lm, 16);
    expect(newGrid.getCell("l1", 0, 0).color).toBe("#aaa");
    expect(newGrid.getCell("l2", 14, 14).color).toBe("#bbb");
    expect(newGrid.getCell("l2", 15, 15).color).toBe("#bbb");
  });

  it("same-size resize preserves content", () => {
    const { grid, lm } = setup(16);
    grid.fillCell("l1", 3, 5, "#123456");
    const newGrid = resizeGrid(grid, lm, 16);
    expect(newGrid.getCell("l1", 3, 5).color).toBe("#123456");
    expect(newGrid.getCell("l1", 0, 0).filled).toBe(false);
  });
});
