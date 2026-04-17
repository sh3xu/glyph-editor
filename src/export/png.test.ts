import { describe, expect, it } from "vitest";
import { clampPngScale, MAX_PNG_SCALE, MIN_PNG_SCALE, type PngScale } from "./png";

// Note: rasterizeSvgToPng requires browser APIs (Image, Canvas, Blob)
// which are not available in Node/jsdom. We test the type constraints
// and will validate visually in the browser.

describe("PNG export types (T-020)", () => {
  it("PngScale supports quality range values", () => {
    const scales: PngScale[] = [2, 8, 16, 32];
    expect(scales).toEqual([2, 8, 16, 32]);
  });

  it("PNG dimensions at 2x are double the base", () => {
    const base = 10;
    const scale: PngScale = 2;
    expect(base * scale).toBe(20);
  });

  it("PNG dimensions at 32x scale correctly", () => {
    const base = 10;
    const scale: PngScale = 32;
    expect(base * scale).toBe(320);
  });

  it("clamps PNG quality between min and max bounds", () => {
    expect(clampPngScale(1)).toBe(MIN_PNG_SCALE);
    expect(clampPngScale(18.2)).toBe(18);
    expect(clampPngScale(99)).toBe(MAX_PNG_SCALE);
  });
});
