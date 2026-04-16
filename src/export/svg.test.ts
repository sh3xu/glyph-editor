import { describe, expect, it } from "vitest";
import type { SmoothedLayerResult } from "../smoothing/slider";
import { generateAdaptiveSvg, generateModeSvg, generateSvg } from "./svg";

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
  {
    layerId: "l2",
    rotation: 0,
    paths: [
      {
        segments: [
          { p0: { x: 2, y: 2 }, c1: { x: 2.5, y: 2 }, c2: { x: 3, y: 2.5 }, p3: { x: 3, y: 3 } },
          { p0: { x: 3, y: 3 }, c1: { x: 2.5, y: 3 }, c2: { x: 2, y: 2.5 }, p3: { x: 2, y: 2 } },
        ],
        isHole: false,
        color: "#0000ff",
      },
    ],
  },
];

describe("generateSvg (T-017)", () => {
  it("produces a valid SVG document", () => {
    const svg = generateSvg({ width: 10, height: 10, layers: MOCK_LAYERS });
    expect(svg).toContain("<svg");
    expect(svg).toContain("xmlns=");
    expect(svg).toContain("</svg>");
  });

  it("each color appears as a path with correct fill", () => {
    const svg = generateSvg({ width: 10, height: 10, layers: MOCK_LAYERS });
    expect(svg).toContain('fill="#ff0000"');
    expect(svg).toContain('fill="#0000ff"');
  });

  it("each layer's paths are wrapped in a group", () => {
    const svg = generateSvg({ width: 10, height: 10, layers: MOCK_LAYERS });
    expect(svg).toContain('data-layer="l1"');
    expect(svg).toContain('data-layer="l2"');
  });

  it("layer groups appear in correct stacking order", () => {
    const svg = generateSvg({ width: 10, height: 10, layers: MOCK_LAYERS });
    const l1Pos = svg.indexOf('data-layer="l1"');
    const l2Pos = svg.indexOf('data-layer="l2"');
    expect(l1Pos).toBeLessThan(l2Pos);
  });

  it("SVG has no external dependencies", () => {
    const svg = generateSvg({ width: 10, height: 10, layers: MOCK_LAYERS });
    expect(svg).not.toContain("href=");
    expect(svg).not.toContain("xlink:");
    // Fills use fill-rule="evenodd" for proper hole rendering
    expect(svg).toContain('fill-rule="evenodd"');
  });
});

describe("generateAdaptiveSvg (T-017 + T-018)", () => {
  it("contains prefers-color-scheme media query", () => {
    const svg = generateAdaptiveSvg(
      { width: 10, height: 10, layers: MOCK_LAYERS },
      "#ffffff",
      "#000000",
      "#000000",
      "#ffffff",
    );
    expect(svg).toContain("prefers-color-scheme");
  });
});

describe("generateModeSvg", () => {
  it("light mode has no media queries", () => {
    const svg = generateModeSvg(
      { width: 10, height: 10, layers: MOCK_LAYERS },
      "light",
      "#ffffff",
      "#000000",
    );
    expect(svg).not.toContain("prefers-color-scheme");
  });

  it("dark mode has no media queries", () => {
    const svg = generateModeSvg(
      { width: 10, height: 10, layers: MOCK_LAYERS },
      "dark",
      "#000000",
      "#ffffff",
    );
    expect(svg).not.toContain("prefers-color-scheme");
  });
});
