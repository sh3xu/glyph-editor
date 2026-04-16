import { describe, expect, it } from "vitest";
import { Grid } from "../models/grid";
import { LayerManager } from "../models/layers";
import { extractAllLayerContours, extractColorContours } from "./multicolor";

const RED = "#ff0000";
const BLUE = "#0000ff";

describe("extractColorContours (T-013)", () => {
  it("two adjacent regions of different colors produce separate contours", () => {
    const grid = new Grid(8);
    grid.fillCell("l1", 0, 0, RED);
    grid.fillCell("l1", 0, 1, BLUE);

    const contours = extractColorContours(grid, "l1");
    const redContours = contours.filter((c) => c.color === RED && !c.isHole);
    const blueContours = contours.filter((c) => c.color === BLUE && !c.isHole);

    expect(redContours.length).toBe(1);
    expect(blueContours.length).toBe(1);
  });

  it("each color's contours are smoothed independently", () => {
    const grid = new Grid(8);
    // Red block
    grid.fillCell("l1", 0, 0, RED);
    grid.fillCell("l1", 0, 1, RED);
    // Blue block
    grid.fillCell("l1", 2, 2, BLUE);

    const contours = extractColorContours(grid, "l1");
    const redOuter = contours.filter((c) => c.color === RED && !c.isHole);
    const blueOuter = contours.filter((c) => c.color === BLUE && !c.isHole);

    expect(redOuter.length).toBe(1);
    expect(blueOuter.length).toBe(1);
  });

  it("output associates each path with its corresponding color", () => {
    const grid = new Grid(8);
    grid.fillCell("l1", 0, 0, RED);
    grid.fillCell("l1", 1, 1, BLUE);

    const contours = extractColorContours(grid, "l1");
    for (const c of contours) {
      expect(c.color === RED || c.color === BLUE).toBe(true);
    }
  });

  it("single color produces contours just like plain extraction", () => {
    const grid = new Grid(8);
    grid.fillCell("l1", 0, 0, RED);
    grid.fillCell("l1", 0, 1, RED);

    const contours = extractColorContours(grid, "l1");
    const outer = contours.filter((c) => !c.isHole);
    expect(outer.length).toBe(1);
    expect(outer[0]!.color).toBe(RED);
  });
});

describe("extractAllLayerContours (T-014)", () => {
  it("smoothing layer A does not depend on layer B", () => {
    const grid = new Grid(8);
    const lm = new LayerManager([
      { id: "l1", name: "Layer 1", visible: true, rotation: 0 },
      { id: "l2", name: "Layer 2", visible: true, rotation: 0 },
    ]);
    grid.fillCell("l1", 0, 0, RED);
    grid.fillCell("l2", 0, 0, BLUE);

    const result = extractAllLayerContours(grid, lm);
    expect(result.length).toBe(2);

    const l1 = result.find((r) => r.layerId === "l1");
    const l2 = result.find((r) => r.layerId === "l2");
    expect(l1!.contours.some((c) => c.color === RED)).toBe(true);
    expect(l2!.contours.some((c) => c.color === BLUE)).toBe(true);
  });

  it("output paths are grouped by layer", () => {
    const grid = new Grid(8);
    const lm = new LayerManager([
      { id: "l1", name: "Layer 1", visible: true, rotation: 0 },
      { id: "l2", name: "Layer 2", visible: true, rotation: 0 },
    ]);
    grid.fillCell("l1", 0, 0, RED);
    grid.fillCell("l2", 1, 1, BLUE);

    const result = extractAllLayerContours(grid, lm);
    expect(result[0]!.layerId).toBeDefined();
    expect(result[1]!.layerId).toBeDefined();
  });

  it("hidden layers are excluded from smoothing output", () => {
    const grid = new Grid(8);
    const lm = new LayerManager([
      { id: "l1", name: "Layer 1", visible: true, rotation: 0 },
      { id: "l2", name: "Layer 2", visible: false, rotation: 0 },
    ]);
    grid.fillCell("l1", 0, 0, RED);
    grid.fillCell("l2", 1, 1, BLUE);

    const result = extractAllLayerContours(grid, lm);
    expect(result.length).toBe(1);
    expect(result[0]!.layerId).toBe("l1");
  });
});
