import { useCallback, useEffect, useRef, useState } from "react";
import type { Grid } from "../models/grid";
import type { LayerManager } from "../models/layers";
import { extractAllLayerContours } from "./multicolor";
import { type SmoothingMode, usesRawGridStyling } from "./mode";
import type { SmoothedLayerResult } from "./smoothPaths";
import { smoothLayerContours } from "./smoothPaths";

export type { SmoothingMode } from "./mode";
export { usesRawGridStyling } from "./mode";
export type { SmoothedLayerResult } from "./smoothPaths";

export function computeSmoothedPaths(
  grid: Grid,
  layerManager: LayerManager,
  alpha: number,
  mode: SmoothingMode = "squircle",
): SmoothedLayerResult[] {
  if (usesRawGridStyling(mode)) {
    return [];
  }
  const layerContours = extractAllLayerContours(grid, layerManager);
  return smoothLayerContours(layerContours, layerManager, alpha, mode);
}

export interface SmoothingSliderState {
  alpha: number;
  setAlpha: (value: number) => void;
  mode: SmoothingMode;
  setMode: (mode: SmoothingMode) => void;
  result: SmoothedLayerResult[];
}

export function useSmoothingSlider(
  grid: Grid,
  layerManager: LayerManager,
  debounceMs: number = 150,
  initialMode: SmoothingMode = "squircle",
): SmoothingSliderState {
  const [alpha, setAlphaRaw] = useState(0.5);
  const [mode, setMode] = useState<SmoothingMode>(initialMode);
  const [result, setResult] = useState<SmoothedLayerResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setAlpha = useCallback((value: number) => {
    setAlphaRaw(Math.max(0, Math.min(1, value)));
  }, []);

  useEffect(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setResult(computeSmoothedPaths(grid, layerManager, alpha, mode));
      timerRef.current = null;
    }, debounceMs);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [alpha, mode, grid, layerManager, debounceMs]);

  return { alpha, setAlpha, mode, setMode, result };
}
