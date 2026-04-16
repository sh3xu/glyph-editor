import { describe, expect, it } from "vitest";
import { Grid } from "../models/grid";
import { padGrid } from "./padding";

describe("padGrid (T-010)", () => {
  it("padded grid is 2 larger in each dimension", () => {
    const grid = new Grid(8);
    const padded = padGrid(grid, "l1");
    expect(padded.width).toBe(10);
    expect(padded.height).toBe(10);
  });

  it("padding cells are always empty", () => {
    const grid = new Grid(8);
    grid.fillCell("l1", 0, 0, "#ff0000");
    const padded = padGrid(grid, "l1");
    // Row 0 and col 0 are padding
    expect(padded.get(0, 0)).toBe(false);
    expect(padded.get(0, 1)).toBe(false);
    expect(padded.get(1, 0)).toBe(false);
    // Bottom-right padding
    expect(padded.get(9, 9)).toBe(false);
  });

  it("edge cell produces a complete unclipped contour area", () => {
    const grid = new Grid(8);
    grid.fillCell("l1", 0, 0, "#ff0000");
    const padded = padGrid(grid, "l1");
    // Cell (0,0) in grid maps to (1,1) in padded
    expect(padded.get(1, 1)).toBe(true);
    // All neighbors of (1,1) in padded are accessible (within bounds)
    expect(padded.get(0, 1)).toBe(false); // padding above
    expect(padded.get(1, 0)).toBe(false); // padding left
    expect(padded.get(2, 1)).toBe(false); // grid cell (1,0) — empty
  });

  it("does not alter original grid state", () => {
    const grid = new Grid(8);
    grid.fillCell("l1", 3, 3, "#00ff00");
    const padded = padGrid(grid, "l1");
    // Just accessing padded grid should not change original
    padded.get(4, 4); // maps to grid (3,3)
    expect(grid.getCell("l1", 3, 3).filled).toBe(true);
    expect(grid.getCell("l1", 3, 3).color).toBe("#00ff00");
  });

  it("interior cells map correctly", () => {
    const grid = new Grid(8);
    grid.fillCell("l1", 4, 5, "#abc");
    const padded = padGrid(grid, "l1");
    expect(padded.get(5, 6)).toBe(true); // (4+1, 5+1)
    expect(padded.getColor(5, 6)).toBe("#abc");
  });
});
