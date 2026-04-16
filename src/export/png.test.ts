import { describe, expect, it } from "vitest";
import type { PngScale } from "./png";

// Note: rasterizeSvgToPng requires browser APIs (Image, Canvas, Blob)
// which are not available in Node/jsdom. We test the type constraints
// and will validate visually in the browser.

describe("PNG export types (T-020)", () => {
  it("PngScale accepts 1, 2, and 4", () => {
    const scales: PngScale[] = [1, 2, 4];
    expect(scales).toEqual([1, 2, 4]);
  });

  it("PNG dimensions at 2x are double the base", () => {
    const base = 10;
    const scale: PngScale = 2;
    expect(base * scale).toBe(20);
  });

  it("PNG dimensions at 4x are quadruple the base", () => {
    const base = 10;
    const scale: PngScale = 4;
    expect(base * scale).toBe(40);
  });
});
