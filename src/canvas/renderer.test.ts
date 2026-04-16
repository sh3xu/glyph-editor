import { describe, expect, it } from "vitest";
import { Grid } from "../models/grid";
import { LayerManager } from "../models/layers";
import { compositeRender } from "./renderer";

function setup(n: number) {
  const grid = new Grid(n);
  const lm = new LayerManager([
    { id: "l1", name: "Bottom", visible: true, rotation: 0 },
    { id: "l2", name: "Top", visible: true, rotation: 0 },
  ]);
  grid.initLayer("l1");
  grid.initLayer("l2");
  return { grid, lm };
}

describe("compositeRender (T-007)", () => {
  it("returns array of length n*n", () => {
    const { grid, lm } = setup(8);
    expect(compositeRender(grid, lm)).toHaveLength(64);
  });

  it("all null when all cells are empty", () => {
    const { grid, lm } = setup(8);
    expect(compositeRender(grid, lm).every((c) => c === null)).toBe(true);
  });

  it("renders single visible layer correctly", () => {
    const { grid, lm } = setup(8);
    grid.fillCell("l1", 1, 2, "#ff0000");
    const result = compositeRender(grid, lm);
    expect(result[1 * 8 + 2]).toBe("#ff0000");
    expect(result[0]).toBeNull();
  });

  it("hidden layers are not rendered", () => {
    const { grid, lm } = setup(8);
    grid.fillCell("l1", 0, 0, "#aabbcc");
    lm.setVisibility("l1", false);
    const result = compositeRender(grid, lm);
    expect(result[0]).toBeNull();
  });

  it("top visible layer wins on overlap", () => {
    const { grid, lm } = setup(8);
    grid.fillCell("l1", 0, 0, "#bottom");
    grid.fillCell("l2", 0, 0, "#top");
    expect(compositeRender(grid, lm)[0]).toBe("#top");
  });

  it("bottom layer shows through when top is empty", () => {
    const { grid, lm } = setup(8);
    grid.fillCell("l1", 0, 0, "#bottom");
    expect(compositeRender(grid, lm)[0]).toBe("#bottom");
  });

  it("hiding top layer reveals bottom layer", () => {
    const { grid, lm } = setup(8);
    grid.fillCell("l1", 0, 0, "#bottom");
    grid.fillCell("l2", 0, 0, "#top");
    lm.setVisibility("l2", false);
    expect(compositeRender(grid, lm)[0]).toBe("#bottom");
  });

  it("all layers hidden returns all null", () => {
    const { grid, lm } = setup(8);
    grid.fillCell("l1", 0, 0, "#aaa");
    grid.fillCell("l2", 1, 1, "#bbb");
    lm.setVisibility("l1", false);
    lm.setVisibility("l2", false);
    expect(compositeRender(grid, lm).every((c) => c === null)).toBe(true);
  });
});
