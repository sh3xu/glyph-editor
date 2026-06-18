import type { CellData } from "../models/grid";
import { clampGridSize } from "../models/grid";
import {
  PROJECT_DOCUMENT_FORMAT_VERSION,
  type ProjectCellJson,
  type ProjectDocument,
} from "../samples/schema";

export const IMPORTED_LAYER_ID = "imported";

function cellsToProjectCells(cells: readonly CellData[]): ProjectCellJson[] {
  return cells.map((c) => (c.filled && c.color !== undefined ? c.color : null));
}

export function buildImageProjectDocument(
  cells: readonly CellData[],
  gridSize: number,
): ProjectDocument {
  const n = clampGridSize(gridSize);
  const expected = n * n;
  if (cells.length !== expected) {
    throw new RangeError(
      `buildImageProjectDocument: expected ${expected} cells, got ${cells.length}`,
    );
  }

  return {
    formatVersion: PROJECT_DOCUMENT_FORMAT_VERSION,
    gridSize: n,
    layers: [
      {
        id: IMPORTED_LAYER_ID,
        name: "Imported",
        visible: true,
        rotation: 0,
        cells: cellsToProjectCells(cells),
      },
    ],
    activeLayerId: IMPORTED_LAYER_ID,
  };
}
