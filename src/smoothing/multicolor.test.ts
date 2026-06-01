import { describe, expect, it } from "vitest";
import { Grid } from "../models/grid";
import {
  extractColorContours,
  maxColorsForSmoothing,
  scaleContourToGrid,
  smoothingSampleStep,
} from "./multicolor";

describe("smoothingSampleStep", () => {
  it("uses coarser sampling on large grids", () => {
    expect(smoothingSampleStep(64)).toBe(1);
    expect(smoothingSampleStep(128)).toBe(2);
    expect(smoothingSampleStep(256)).toBe(4);
  });
});

describe("maxColorsForSmoothing", () => {
  it("lowers color cap on large grids", () => {
    expect(maxColorsForSmoothing(64)).toBe(96);
    expect(maxColorsForSmoothing(128)).toBe(48);
    expect(maxColorsForSmoothing(256)).toBe(32);
  });
});

describe("scaleContourToGrid", () => {
  it("scales sample-space points to full grid padded coordinates", () => {
    const scaled = scaleContourToGrid(
      { isHole: false, points: [{ x: 2, y: 2 }, { x: 3, y: 2 }] },
      4,
    );
    expect(scaled.points[0]).toEqual({ x: 5, y: 5 });
    expect(scaled.points[1]).toEqual({ x: 9, y: 5 });
  });
});

describe("extractColorContours sampling", () => {
  it("still extracts contours on a 128 grid block", () => {
    const grid = new Grid(128);
    grid.initLayer("l1");
    for (let row = 40; row < 88; row++) {
      for (let col = 40; col < 88; col++) {
        grid.fillCell("l1", row, col, "#ff0000");
      }
    }
    const contours = extractColorContours(grid, "l1");
    expect(contours.length).toBeGreaterThan(0);
  });
});
