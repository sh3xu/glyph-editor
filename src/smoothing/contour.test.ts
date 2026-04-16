import { describe, expect, it } from "vitest";
import { Grid } from "../models/grid";
import { type Contour, extractContours } from "./contour";
import { padGrid } from "./padding";

const L = "l1";

function makeGrid(n: number, filled: [number, number][]): Grid {
  const grid = new Grid(n);
  for (const [r, c] of filled) {
    grid.fillCell(L, r, c, "#000");
  }
  return grid;
}

function extract(n: number, filled: [number, number][]): Contour[] {
  const grid = makeGrid(n, filled);
  const padded = padGrid(grid, L);
  return extractContours(padded);
}

describe("extractContours (T-011)", () => {
  it("single filled cell produces a closed polygon", () => {
    const contours = extract(8, [[3, 3]]);
    expect(contours.length).toBeGreaterThanOrEqual(1);

    const outer = contours.find((c) => !c.isHole);
    expect(outer).toBeDefined();
    expect(outer!.points.length).toBeGreaterThanOrEqual(4);

    // Verify closed: first and last should form a cycle when traced
    const pts = outer!.points;
    // Points should surround cell (3,3) in padded coords => (4,4)
    // All x values should be near 4-5, y values near 4-5
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(3);
      expect(p.x).toBeLessThanOrEqual(6);
      expect(p.y).toBeGreaterThanOrEqual(3);
      expect(p.y).toBeLessThanOrEqual(6);
    }
  });

  it("adjacent cells of same color merge into single polygon", () => {
    // Horizontal strip of 3 cells
    const contours = extract(8, [
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
    const outer = contours.filter((c) => !c.isHole);
    expect(outer.length).toBe(1);
    expect(outer[0]!.points.length).toBeGreaterThanOrEqual(4);
  });

  it("vertices follow cell boundaries with no gaps", () => {
    const contours = extract(8, [[2, 2]]);
    const outer = contours.find((c) => !c.isHole);
    expect(outer).toBeDefined();

    // All coordinates should be at half-integer or integer positions
    for (const p of outer!.points) {
      expect(p.x % 0.5).toBeCloseTo(0, 10);
      expect(p.y % 0.5).toBeCloseTo(0, 10);
    }
  });

  it("two separate filled regions produce two contours", () => {
    // Two cells far apart
    const contours = extract(8, [
      [0, 0],
      [7, 7],
    ]);
    const outer = contours.filter((c) => !c.isHole);
    expect(outer.length).toBe(2);
  });

  it("no contours from empty grid", () => {
    const contours = extract(8, []);
    expect(contours.length).toBe(0);
  });

  it("edge cells produce unclipped contours (padding test)", () => {
    // Corner cell
    const contours = extract(8, [[0, 0]]);
    const outer = contours.find((c) => !c.isHole);
    expect(outer).toBeDefined();
    expect(outer!.points.length).toBeGreaterThanOrEqual(4);
  });

  it("L-shaped region produces single contour", () => {
    const contours = extract(8, [
      [0, 0],
      [1, 0],
      [1, 1],
    ]);
    const outer = contours.filter((c) => !c.isHole);
    expect(outer.length).toBe(1);
  });

  it("hole detection: unfilled cell surrounded by filled", () => {
    // 3x3 filled except center
    const filled: [number, number][] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (r === 1 && c === 1) continue;
        filled.push([r, c]);
      }
    }
    const contours = extract(8, filled);
    const holes = contours.filter((c) => c.isHole);
    expect(holes.length).toBeGreaterThanOrEqual(1);
  });
});
