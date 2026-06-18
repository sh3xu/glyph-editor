import type { CellData } from "../models/grid";
import { clampGridSize } from "../models/grid";
import { type DrawImageRects, type ImageFit, computeFitRects } from "./fitRects";
import { chooseQuantizeBits, quantizeRgb } from "./quantize";

export interface ImageImportOptions {
  fit: ImageFit;
  alphaThreshold: number;
}

export const DEFAULT_IMAGE_IMPORT_OPTIONS: ImageImportOptions = {
  fit: "contain",
  alphaThreshold: 128,
};

export function clampAlphaThreshold(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * NOTE: Maps row-major ImageData (gridSize²) to grid cells.
 */
export function imageDataToCells(
  data: ImageData,
  gridSize: number,
  alphaThreshold: number,
): CellData[] {
  const expected = gridSize * gridSize;
  if (data.width !== gridSize || data.height !== gridSize) {
    throw new RangeError(
      `imageDataToCells: expected ${gridSize}x${gridSize} ImageData, got ${data.width}x${data.height}`,
    );
  }
  if (data.data.length !== expected * 4) {
    throw new RangeError(`imageDataToCells: unexpected data length ${data.data.length}`);
  }

  const threshold = clampAlphaThreshold(alphaThreshold);
  const quantizeBits = chooseQuantizeBits(data.data, gridSize, gridSize, threshold);
  const cells: CellData[] = Array.from({ length: expected }, () => ({
    filled: false,
    color: undefined,
  }));

  const pixels = data.data;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const i = (row * gridSize + col) * 4;
      const a = pixels[i + 3]!;
      if (a < threshold) {
        continue;
      }
      cells[row * gridSize + col] = {
        filled: true,
        color: quantizeRgb(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!, quantizeBits),
      };
    }
  }

  return cells;
}

function drawImageToImageData(
  image: CanvasImageSource,
  gridSize: number,
  rects: DrawImageRects,
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = gridSize;
  canvas.height = gridSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D canvas context for image import");
  }
  ctx.clearRect(0, 0, gridSize, gridSize);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, rects.sx, rects.sy, rects.sw, rects.sh, rects.dx, rects.dy, rects.dw, rects.dh);
  return ctx.getImageData(0, 0, gridSize, gridSize);
}

/**
 * NOTE: Rasterizes an image to grid cells via an offscreen canvas (browser only).
 */
export function rasterizeImageToCells(
  image: CanvasImageSource,
  imgW: number,
  imgH: number,
  gridSize: number,
  options: ImageImportOptions,
): CellData[] {
  const n = clampGridSize(gridSize);
  const rects = computeFitRects(imgW, imgH, n, options.fit);
  const imageData = drawImageToImageData(image, n, rects);
  return imageDataToCells(imageData, n, options.alphaThreshold);
}
