import { beforeEach, describe, expect, it } from "vitest";
import { Grid } from "../models/grid";
import { LayerManager } from "../models/layers";
import { DrawStrokeCommand, History, ResizeCommand } from "./history";
import { resizeGrid } from "./resize";

const L = "layer-1";
const RED = "#ff0000";
const BLUE = "#0000ff";

describe("History + DrawStrokeCommand (T-008)", () => {
  let grid: Grid;
  let history: History;

  beforeEach(() => {
    grid = new Grid(8);
    history = new History();
  });

  it("undoing a draw stroke restores cells to prior state", () => {
    const before = { ...grid.getCell(L, 0, 0) };
    grid.fillCell(L, 0, 0, RED);
    const after = { ...grid.getCell(L, 0, 0) };

    const cmd = new DrawStrokeCommand(grid, L, [{ row: 0, col: 0, before, after }]);
    history.push(cmd);

    history.undo();
    expect(grid.getCell(L, 0, 0).filled).toBe(false);
  });

  it("undoing an erase stroke restores erased cells", () => {
    grid.fillCell(L, 1, 1, RED);
    const before = { ...grid.getCell(L, 1, 1) };
    grid.eraseCell(L, 1, 1);
    const after = { ...grid.getCell(L, 1, 1) };

    const cmd = new DrawStrokeCommand(grid, L, [{ row: 1, col: 1, before, after }]);
    history.push(cmd);

    history.undo();
    expect(grid.getCell(L, 1, 1).filled).toBe(true);
    expect(grid.getCell(L, 1, 1).color).toBe(RED);
  });

  it("redo replays the most recently undone operation", () => {
    const before = { ...grid.getCell(L, 2, 2) };
    grid.fillCell(L, 2, 2, BLUE);
    const after = { ...grid.getCell(L, 2, 2) };

    const cmd = new DrawStrokeCommand(grid, L, [{ row: 2, col: 2, before, after }]);
    history.push(cmd);

    history.undo();
    expect(grid.getCell(L, 2, 2).filled).toBe(false);

    history.redo();
    expect(grid.getCell(L, 2, 2).filled).toBe(true);
    expect(grid.getCell(L, 2, 2).color).toBe(BLUE);
  });

  it("new operation after undo discards redo history", () => {
    const b1 = { ...grid.getCell(L, 0, 0) };
    grid.fillCell(L, 0, 0, RED);
    const a1 = { ...grid.getCell(L, 0, 0) };
    history.push(new DrawStrokeCommand(grid, L, [{ row: 0, col: 0, before: b1, after: a1 }]));

    history.undo();
    expect(history.canRedo).toBe(true);

    const b2 = { ...grid.getCell(L, 1, 1) };
    grid.fillCell(L, 1, 1, BLUE);
    const a2 = { ...grid.getCell(L, 1, 1) };
    history.push(new DrawStrokeCommand(grid, L, [{ row: 1, col: 1, before: b2, after: a2 }]));

    expect(history.canRedo).toBe(false);
  });

  it("undo on empty history is a no-op", () => {
    expect(history.canUndo).toBe(false);
    history.undo(); // should not throw
    expect(grid.getCell(L, 0, 0).filled).toBe(false);
  });

  it("redo on empty redo stack is a no-op", () => {
    expect(history.canRedo).toBe(false);
    history.redo(); // should not throw
  });

  it("undoes multi-cell stroke atomically", () => {
    const changes = [];
    for (let c = 0; c < 3; c++) {
      const before = { ...grid.getCell(L, 0, c) };
      grid.fillCell(L, 0, c, RED);
      const after = { ...grid.getCell(L, 0, c) };
      changes.push({ row: 0, col: c, before, after });
    }
    history.push(new DrawStrokeCommand(grid, L, changes));

    history.undo();
    for (let c = 0; c < 3; c++) {
      expect(grid.getCell(L, 0, c).filled).toBe(false);
    }
  });
});

describe("History + ResizeCommand (T-009)", () => {
  it("undoing a resize restores previous grid dimensions and data", () => {
    const lm = new LayerManager([
      { id: L, name: "Layer 1", visible: true, rotation: 0 },
      { id: "l2", name: "Layer 2", visible: true, rotation: 0 },
    ]);
    let grid = new Grid(8);
    grid.fillCell(L, 0, 0, RED);

    const history = new History();
    const beforeGrid = grid;
    const afterGrid = resizeGrid(grid, lm, 16);

    const setGrid = (g: Grid) => {
      grid = g;
    };
    const cmd = new ResizeCommand(setGrid, beforeGrid, afterGrid);
    cmd.execute();
    history.push(cmd);

    expect(grid.n).toBe(16);

    history.undo();
    expect(grid.n).toBe(8);
    expect(grid.getCell(L, 0, 0).color).toBe(RED);
  });

  it("redo restores the resized grid", () => {
    const lm = new LayerManager([
      { id: L, name: "Layer 1", visible: true, rotation: 0 },
      { id: "l2", name: "Layer 2", visible: true, rotation: 0 },
    ]);
    let grid = new Grid(8);

    const history = new History();
    const beforeGrid = grid;
    const afterGrid = resizeGrid(grid, lm, 16);

    const setGrid = (g: Grid) => {
      grid = g;
    };
    const cmd = new ResizeCommand(setGrid, beforeGrid, afterGrid);
    cmd.execute();
    history.push(cmd);

    history.undo();
    expect(grid.n).toBe(8);

    history.redo();
    expect(grid.n).toBe(16);
  });
});
