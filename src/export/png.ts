export const MIN_PNG_SCALE = 2;
export const MAX_PNG_SCALE = 32;
export type PngScale = number;

export function clampPngScale(scale: number): PngScale {
  const rounded = Math.round(scale);
  return Math.min(MAX_PNG_SCALE, Math.max(MIN_PNG_SCALE, rounded));
}

/**
 * Rasterize an SVG string to a PNG blob at a given scale multiplier.
 * Uses browser SVG→Canvas→PNG pipeline.
 *
 * @param svgString - Self-contained SVG markup
 * @param baseWidth - SVG viewBox width
 * @param baseHeight - SVG viewBox height
 * @param scale - Resolution multiplier (2x to 32x)
 * @returns Promise<Blob> — PNG image blob
 */
export function rasterizeSvgToPng(
  svgString: string,
  baseWidth: number,
  baseHeight: number,
  scale: PngScale,
): Promise<Blob> {
  const safeScale = clampPngScale(scale);
  const pxWidth = baseWidth * safeScale;
  const pxHeight = baseHeight * safeScale;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = pxWidth;
      canvas.height = pxHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2d context"));
        return;
      }
      ctx.drawImage(img, 0, 0, pxWidth, pxHeight);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create PNG blob"));
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG for rasterization"));
    };

    img.src = url;
  });
}
