export type ImageFit = "contain" | "cover";

export interface DrawImageRects {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

/**
 * NOTE: Computes drawImage source/dest rects to fit an image into a square grid canvas.
 */
export function computeFitRects(
  imgW: number,
  imgH: number,
  gridSize: number,
  fit: ImageFit,
): DrawImageRects {
  if (imgW <= 0 || imgH <= 0 || gridSize <= 0) {
    throw new RangeError("Image and grid dimensions must be positive");
  }

  const scale =
    fit === "contain"
      ? Math.min(gridSize / imgW, gridSize / imgH)
      : Math.max(gridSize / imgW, gridSize / imgH);

  const dw = imgW * scale;
  const dh = imgH * scale;
  const dx = (gridSize - dw) / 2;
  const dy = (gridSize - dh) / 2;

  return { sx: 0, sy: 0, sw: imgW, sh: imgH, dx, dy, dw, dh };
}
