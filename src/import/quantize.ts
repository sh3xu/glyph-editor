import { rgbaToHex } from "./color";

/** NOTE: Keeps imported photos within what the vector preview pipeline can handle. */
export const MAX_IMPORT_UNIQUE_COLORS = 64;

function quantizeChannel(value: number, bitsPerChannel: number): number {
  const levels = (1 << bitsPerChannel) - 1;
  if (levels <= 0) {
    return 0;
  }
  const scaled = Math.round((value / 255) * levels);
  return Math.round((scaled / levels) * 255);
}

export function quantizeRgb(r: number, g: number, b: number, bitsPerChannel: number): string {
  return rgbaToHex(
    quantizeChannel(r, bitsPerChannel),
    quantizeChannel(g, bitsPerChannel),
    quantizeChannel(b, bitsPerChannel),
  );
}

export function countQuantizedUniqueColors(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold: number,
  bitsPerChannel: number,
): number {
  const colors = new Set<string>();
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const i = (row * width + col) * 4;
      if (pixels[i + 3]! < alphaThreshold) {
        continue;
      }
      colors.add(quantizeRgb(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!, bitsPerChannel));
    }
  }
  return colors.size;
}

/**
 * NOTE: Picks the coarsest quantization that stays at or under maxColors (fewer contour passes).
 */
export function chooseQuantizeBits(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold: number,
  maxColors: number = MAX_IMPORT_UNIQUE_COLORS,
): number {
  for (let bits = 6; bits >= 2; bits--) {
    if (countQuantizedUniqueColors(pixels, width, height, alphaThreshold, bits) <= maxColors) {
      return bits;
    }
  }
  return 2;
}
