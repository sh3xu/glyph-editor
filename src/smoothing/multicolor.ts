import type { Grid } from "../models/grid";
import type { LayerManager } from "../models/layers";
import { type Contour, extractContours } from "./contour";
import type { PaddedGrid } from "./padding";

export interface ColoredContour extends Contour {
  color: string;
}

export interface LayerContours {
  layerId: string;
  contours: ColoredContour[];
}

/** NOTE: Each color runs a full contour pass; cap avoids UI freezes on dense imports. */
export const MAX_LAYER_COLORS_FOR_SMOOTHING = 96;

/** NOTE: Coarser marching-squares grid for large canvases (keeps styling responsive). */
export function smoothingSampleStep(gridSize: number): number {
  if (gridSize >= 192) {
    return 4;
  }
  if (gridSize >= 128) {
    return 2;
  }
  return 1;
}

export function maxColorsForSmoothing(gridSize: number): number {
  if (gridSize >= 192) {
    return 32;
  }
  if (gridSize >= 128) {
    return 48;
  }
  return MAX_LAYER_COLORS_FOR_SMOOTHING;
}

/**
 * Create a padded grid view that only considers cells of a specific color.
 */
function padGridForColor(grid: Grid, layerId: string, color: string, sampleStep: number): PaddedGrid {
  const n = grid.n;
  const cellsPerAxis = Math.ceil(n / sampleStep);
  const width = cellsPerAxis + 2;
  const height = cellsPerAxis + 2;

  return {
    width,
    height,
    get(row: number, col: number): boolean {
      if (row <= 0 || row > cellsPerAxis || col <= 0 || col > cellsPerAxis) {
        return false;
      }
      const r0 = (row - 1) * sampleStep;
      const c0 = (col - 1) * sampleStep;
      for (let dr = 0; dr < sampleStep && r0 + dr < n; dr++) {
        for (let dc = 0; dc < sampleStep && c0 + dc < n; dc++) {
          const cell = grid.getCell(layerId, r0 + dr, c0 + dc);
          if (cell.filled && cell.color === color) {
            return true;
          }
        }
      }
      return false;
    },
    getColor(row: number, col: number): string | undefined {
      if (row <= 0 || row > cellsPerAxis || col <= 0 || col > cellsPerAxis) {
        return undefined;
      }
      const r0 = (row - 1) * sampleStep;
      const c0 = (col - 1) * sampleStep;
      for (let dr = 0; dr < sampleStep && r0 + dr < n; dr++) {
        for (let dc = 0; dc < sampleStep && c0 + dc < n; dc++) {
          const cell = grid.getCell(layerId, r0 + dr, c0 + dc);
          if (cell.filled && cell.color === color) {
            return color;
          }
        }
      }
      return undefined;
    },
  };
}

/**
 * Extract contours per color from a single layer.
 */
export function extractColorContours(grid: Grid, layerId: string): ColoredContour[] {
  const n = grid.n;
  const sampleStep = smoothingSampleStep(n);
  const colorCap = maxColorsForSmoothing(n);
  const colors = new Set<string>();
  const cells = grid.getLayerCells(layerId);

  for (let idx = 0; idx < cells.length; idx++) {
    const cell = cells[idx]!;
    if (cell.filled && cell.color !== undefined) {
      colors.add(cell.color);
      if (colors.size > colorCap) {
        return [];
      }
    }
  }

  const result: ColoredContour[] = [];

  for (const color of colors) {
    const padded = padGridForColor(grid, layerId, color, sampleStep);
    const contours = extractContours(padded);
    for (const contour of contours) {
      result.push({ ...contour, color });
    }
  }

  return result;
}

/**
 * Extract contours for all visible layers, grouped by layer.
 * Hidden layers are excluded.
 */
export function extractAllLayerContours(grid: Grid, layerManager: LayerManager): LayerContours[] {
  const result: LayerContours[] = [];

  for (const layer of layerManager.getVisibleLayers()) {
    const contours = extractColorContours(grid, layer.id);
    result.push({ layerId: layer.id, contours });
  }

  return result;
}
