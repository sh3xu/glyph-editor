import type { LayerManager } from "../models/layers";
import { yieldToMain } from "../shared/yieldToMain";
import { type SmoothedPath, smoothContour, smoothContourSubdivision } from "./bezier";
import type { Contour } from "./contour";
import type { ColoredContour, LayerContours } from "./multicolor";
import { type SmoothingMode, usesRawGridStyling } from "./mode";

const CONTOURS_PER_YIELD = 6;

export interface SmoothedLayerResult {
  layerId: string;
  paths: Array<SmoothedPath & { color: string }>;
  rotation: number;
}

type StyledSmoothingMode = Exclude<SmoothingMode, "none">;

const MODE_CONFIG: Record<
  StyledSmoothingMode,
  {
    smoother: (contour: Contour, alpha: number) => SmoothedPath;
    alphaTransform: (a: number) => number;
  }
> = {
  pixel: { smoother: smoothContour, alphaTransform: () => 0 },
  squircle: { smoother: smoothContour, alphaTransform: (a) => a },
  smooth: { smoother: smoothContourSubdivision, alphaTransform: (a) => a },
};

/** NOTE: Bezier pass with yields between contour batches so the UI stays responsive. */
export async function smoothLayerContoursAsync(
  layerContours: readonly LayerContours[],
  layerManager: LayerManager,
  alpha: number,
  mode: SmoothingMode,
): Promise<SmoothedLayerResult[]> {
  if (usesRawGridStyling(mode)) {
    return [];
  }

  const styledMode = mode as StyledSmoothingMode;
  const { smoother, alphaTransform } = MODE_CONFIG[styledMode];
  const adjustedAlpha = alphaTransform(alpha);
  const result: SmoothedLayerResult[] = [];

  await yieldToMain();
  let processedSinceYield = 0;

  for (const lc of layerContours) {
    const layer = layerManager.getLayer(lc.layerId);
    const paths: Array<SmoothedPath & { color: string }> = [];

    for (const contour of lc.contours) {
      paths.push({
        ...smoother(contour, adjustedAlpha),
        color: contour.color,
      });
      processedSinceYield++;
      if (processedSinceYield >= CONTOURS_PER_YIELD) {
        processedSinceYield = 0;
        await yieldToMain();
      }
    }

    result.push({
      layerId: lc.layerId,
      paths,
      rotation: layer?.rotation ?? 0,
    });
    await yieldToMain();
  }

  return result;
}

/** NOTE: Synchronous Bezier pass for export/tests. */
export function smoothLayerContours(
  layerContours: readonly LayerContours[],
  layerManager: LayerManager,
  alpha: number,
  mode: SmoothingMode,
): SmoothedLayerResult[] {
  if (usesRawGridStyling(mode)) {
    return [];
  }

  const styledMode = mode as StyledSmoothingMode;
  const { smoother, alphaTransform } = MODE_CONFIG[styledMode];
  const adjustedAlpha = alphaTransform(alpha);

  return layerContours.map((lc) => {
    const layer = layerManager.getLayer(lc.layerId);
    return {
      layerId: lc.layerId,
      paths: lc.contours.map((c: ColoredContour) => ({
        ...smoother(c, adjustedAlpha),
        color: c.color,
      })),
      rotation: layer?.rotation ?? 0,
    };
  });
}
