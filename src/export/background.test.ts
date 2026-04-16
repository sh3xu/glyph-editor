import { describe, expect, it } from "vitest";
import type { SmoothedLayerResult } from "../smoothing/slider";
import { type BackgroundOption, generateSvgWithBackground } from "./background";

const MOCK_LAYERS: SmoothedLayerResult[] = [
  {
    layerId: "l1",
    rotation: 0,
    paths: [
      {
        segments: [
          { p0: { x: 0, y: 0 }, c1: { x: 0.5, y: 0 }, c2: { x: 1, y: 0.5 }, p3: { x: 1, y: 1 } },
          { p0: { x: 1, y: 1 }, c1: { x: 0.5, y: 1 }, c2: { x: 0, y: 0.5 }, p3: { x: 0, y: 0 } },
        ],
        isHole: false,
        color: "#ff0000",
      },
    ],
  },
];

describe("generateSvgWithBackground (T-019)", () => {
  it("transparent background produces no background element", () => {
    const bg: BackgroundOption = { type: "transparent" };
    const svg = generateSvgWithBackground(10, 10, MOCK_LAYERS, bg);
    expect(svg).not.toContain("<rect");
    expect(svg).not.toContain("<image");
  });

  it("solid color background inserts a rect behind all content", () => {
    const bg: BackgroundOption = { type: "solid", color: "#ffffff" };
    const svg = generateSvgWithBackground(10, 10, MOCK_LAYERS, bg);
    expect(svg).toContain('fill="#ffffff"');
    // Rect should appear before paths
    const rectPos = svg.indexOf("<rect");
    const pathPos = svg.indexOf("<path");
    expect(rectPos).toBeLessThan(pathPos);
  });

  it("image background embeds image behind all content", () => {
    const bg: BackgroundOption = { type: "image", dataUrl: "data:image/png;base64,abc" };
    const svg = generateSvgWithBackground(10, 10, MOCK_LAYERS, bg);
    expect(svg).toContain("<image");
    expect(svg).toContain("data:image/png;base64,abc");
    const imgPos = svg.indexOf("<image");
    const pathPos = svg.indexOf("<path");
    expect(imgPos).toBeLessThan(pathPos);
  });
});
