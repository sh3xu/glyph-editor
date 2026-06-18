import { describe, expect, it } from "vitest";
import { chooseQuantizeBits, countQuantizedUniqueColors, quantizeRgb } from "./quantize";

describe("quantizeRgb", () => {
  it("merges similar colors at low bit depth", () => {
    expect(quantizeRgb(10, 12, 14, 4)).toBe(quantizeRgb(18, 20, 22, 4));
  });
});

describe("chooseQuantizeBits", () => {
  it("returns coarser bits when many distinct colors are present", () => {
    const width = 4;
    const height = 4;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      const offset = i * 4;
      data[offset] = i * 17;
      data[offset + 1] = i * 13;
      data[offset + 2] = i * 11;
      data[offset + 3] = 255;
    }
    const bits = chooseQuantizeBits(data, width, height, 128, 8);
    expect(bits).toBeLessThanOrEqual(4);
    expect(countQuantizedUniqueColors(data, width, height, 128, bits)).toBeLessThanOrEqual(8);
  });
});
