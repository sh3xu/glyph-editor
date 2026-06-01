import type { LayerManager } from "../models/layers";
import { type SmoothedPath, smoothContour, smoothContourSubdivision } from "./bezier";
import type { Contour } from "./contour";
import type { ColoredContour, LayerContours } from "./multicolor";
import { type SmoothingMode, usesRawGridStyling } from "./mode";

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

/** NOTE: Bezier pass only; safe to run on every styling slider tick when contours are cached. */
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
