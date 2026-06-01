import type { Grid } from "../models/grid";
import type { LayerManager } from "../models/layers";
import { nearestColorInPalette } from "./colorPalette";
import { type Contour, type Point, extractContours } from "./contour";
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

function cellMatchesColorGroup(
  cell: { filled: boolean; color: string | undefined },
  matchColors: ReadonlySet<string>,
): boolean {
  return cell.filled && cell.color !== undefined && matchColors.has(cell.color);
}

/**
 * Create a padded grid view for a color group (representative + merged aliases).
 */
function padGridForColorGroup(
  grid: Grid,
  layerId: string,
  representative: string,
  matchColors: ReadonlySet<string>,
  sampleStep: number,
): PaddedGrid {
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
          if (cellMatchesColorGroup(cell, matchColors)) {
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
          if (cellMatchesColorGroup(cell, matchColors)) {
            return representative;
          }
        }
      }
      return undefined;
    },
  };
}

/** NOTE: Map padded sample-space contour coords back to full-grid padded coordinates. */
export function scaleContourToGrid(contour: Contour, sampleStep: number): Contour {
  if (sampleStep <= 1) {
    return contour;
  }
  const scalePoint = (p: Point): Point => ({
    x: (p.x - 1) * sampleStep + 1,
    y: (p.y - 1) * sampleStep + 1,
  });
  return {
    isHole: contour.isHole,
    points: contour.points.map(scalePoint),
  };
}

export interface ColorExtractionGroup {
  representative: string;
  matchColors: ReadonlySet<string>;
}

export interface ColorExtractionPlan {
  sampleStep: number;
  groups: ColorExtractionGroup[];
}

export function buildColorExtractionGroups(
  grid: Grid,
  layerId: string,
  maxColors: number,
): ColorExtractionGroup[] {
  const counts = grid.countFillColors(layerId);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (sorted.length === 0) {
    return [];
  }

  const primary = sorted.slice(0, maxColors).map(([color]) => color);
  const groups = new Map<string, Set<string>>();

  for (const color of primary) {
    groups.set(color, new Set([color]));
  }

  for (const [color] of sorted.slice(maxColors)) {
    const target = nearestColorInPalette(color, primary);
    groups.get(target)?.add(color);
  }

  return [...groups.entries()].map(([representative, matchColors]) => ({
    representative,
    matchColors,
  }));
}

export function getColorExtractionPlan(grid: Grid, layerId: string): ColorExtractionPlan {
  const n = grid.n;
  return {
    sampleStep: smoothingSampleStep(n),
    groups: buildColorExtractionGroups(grid, layerId, maxColorsForSmoothing(n)),
  };
}

export function extractColorContoursForGroups(
  grid: Grid,
  layerId: string,
  groups: readonly ColorExtractionGroup[],
  sampleStep: number,
): ColoredContour[] {
  const result: ColoredContour[] = [];

  for (const group of groups) {
    const padded = padGridForColorGroup(
      grid,
      layerId,
      group.representative,
      group.matchColors,
      sampleStep,
    );
    const contours = extractContours(padded);
    for (const contour of contours) {
      result.push({ ...scaleContourToGrid(contour, sampleStep), color: group.representative });
    }
  }

  return result;
}

/**
 * Extract contours per color from a single layer.
 */
export function extractColorContours(grid: Grid, layerId: string): ColoredContour[] {
  const plan = getColorExtractionPlan(grid, layerId);
  return extractColorContoursForGroups(grid, layerId, plan.groups, plan.sampleStep);
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
