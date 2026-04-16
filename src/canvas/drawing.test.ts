import { beforeEach, describe, expect, it } from "vitest";
import { Grid } from "../models/grid";
import { applyStroke, applyStrokeStep, createStroke, toggleCell } from "./drawing";

const LAYER = "layer-a";
const OTHER = "layer-b";
const RED = "#ff0000";
const BLUE = "#0000ff";

describe("toggleCell (T-004)", () => {
  let grid: Grid;

  beforeEach(() => {
    grid = new Grid(8);
  });

  it("fills an empty cell with the active color on the active layer", () => {
    toggleCell(grid, LAYER, 0, 0, RED);
    const cell = grid.getCell(LAYER, 0, 0);
    expect(cell.filled).toBe(true);
    expect(cell.color).toBe(RED);
  });

  it("clears a filled cell on the active layer", () => {
    grid.fillCell(LAYER, 0, 0, RED);
    toggleCell(grid, LAYER, 0, 0, RED);
    expect(grid.getCell(LAYER, 0, 0).filled).toBe(false);
  });

  it("only affects the active layer", () => {
    grid.fillCell(OTHER, 2, 2, BLUE);
    toggleCell(grid, LAYER, 2, 2, RED);
    expect(grid.getCell(LAYER, 2, 2).filled).toBe(true);
    expect(grid.getCell(OTHER, 2, 2).filled).toBe(true);
    expect(grid.getCell(OTHER, 2, 2).color).toBe(BLUE);
  });
});

describe("drag paint (T-005)", () => {
  let grid: Grid;

  beforeEach(() => {
    grid = new Grid(8);
  });

  it("fills all traversed cells with active color", () => {
    const stroke = createStroke("paint", { row: 0, col: 0 });
    applyStroke(
      grid,
      LAYER,
      stroke,
      [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
      RED,
    );
    expect(grid.getCell(LAYER, 0, 0).filled).toBe(true);
    expect(grid.getCell(LAYER, 0, 1).filled).toBe(true);
    expect(grid.getCell(LAYER, 0, 2).filled).toBe(true);
  });

  it("erase mode clears all traversed cells", () => {
    grid.fillCell(LAYER, 0, 0, RED);
    grid.fillCell(LAYER, 0, 1, RED);
    const stroke = createStroke("erase", { row: 0, col: 0 });
    applyStroke(
      grid,
      LAYER,
      stroke,
      [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
      ],
      RED,
    );
    expect(grid.getCell(LAYER, 0, 0).filled).toBe(false);
    expect(grid.getCell(LAYER, 0, 1).filled).toBe(false);
  });

  it("drag only affects the active layer", () => {
    grid.fillCell(OTHER, 1, 1, BLUE);
    const stroke = createStroke("paint", { row: 1, col: 1 });
    applyStrokeStep(grid, LAYER, stroke, 1, 1, RED);
    expect(grid.getCell(OTHER, 1, 1).color).toBe(BLUE);
  });

  it("drag starting outside the grid does not produce fills", () => {
    const stroke = createStroke("paint", null);
    applyStrokeStep(grid, LAYER, stroke, 0, 0, RED);
    applyStrokeStep(grid, LAYER, stroke, 1, 1, RED);
    expect(grid.getCell(LAYER, 0, 0).filled).toBe(false);
    expect(grid.getCell(LAYER, 1, 1).filled).toBe(false);
  });

  it("does not re-apply already visited cells in same stroke", () => {
    grid.fillCell(LAYER, 0, 0, RED);
    const stroke = createStroke("paint", { row: 0, col: 0 });
    applyStrokeStep(grid, LAYER, stroke, 0, 0, RED);
    grid.eraseCell(LAYER, 0, 0); // external mutation
    applyStrokeStep(grid, LAYER, stroke, 0, 0, RED); // should be no-op (already visited)
    expect(grid.getCell(LAYER, 0, 0).filled).toBe(false);
  });
});
