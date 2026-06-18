import type { Grid } from "../models/grid";
import type { LayerManager } from "../models/layers";
import { yieldToMain } from "../shared/yieldToMain";
import type { SmoothingMode } from "./mode";
import {
  type ColoredContour,
  type LayerContours,
  extractColorContoursForGroups,
  getColorExtractionPlan,
} from "./multicolor";
import type { SmoothedLayerResult } from "./smoothPaths";
import { smoothLayerContoursAsync } from "./smoothPaths";

const COLORS_PER_CHUNK = 2;

export const PREVIEW_MIN_LOADER_MS = 140;

export async function extractAllLayerContoursChunked(
  grid: Grid,
  layerManager: LayerManager,
): Promise<LayerContours[]> {
  await yieldToMain();
  const result: LayerContours[] = [];

  for (const layer of layerManager.getVisibleLayers()) {
    const plan = getColorExtractionPlan(grid, layer.id);
    const contours: ColoredContour[] = [];

    for (let i = 0; i < plan.groups.length; i += COLORS_PER_CHUNK) {
      const batch = plan.groups.slice(i, i + COLORS_PER_CHUNK);
      contours.push(...extractColorContoursForGroups(grid, layer.id, batch, plan.sampleStep));
      if (i + COLORS_PER_CHUNK < plan.groups.length) {
        await yieldToMain();
      }
    }

    result.push({ layerId: layer.id, contours });
    await yieldToMain();
  }

  return result;
}

export async function smoothLayerContoursChunked(
  layerContours: readonly LayerContours[],
  layerManager: LayerManager,
  alpha: number,
  mode: SmoothingMode,
): Promise<SmoothedLayerResult[]> {
  return smoothLayerContoursAsync(layerContours, layerManager, alpha, mode);
}

export async function runPreviewSmoothingPipeline(
  grid: Grid,
  layerManager: LayerManager,
  version: number,
  alpha: number,
  mode: SmoothingMode,
  contourCache: { version: number; contours: LayerContours[] } | null,
): Promise<{ contours: LayerContours[]; result: SmoothedLayerResult[] }> {
  await yieldToMain();

  let contours =
    contourCache?.version === version ? contourCache.contours : undefined;

  if (!contours) {
    contours = await extractAllLayerContoursChunked(grid, layerManager);
  }

  const result = await smoothLayerContoursChunked(contours, layerManager, alpha, mode);
  return { contours, result };
}
