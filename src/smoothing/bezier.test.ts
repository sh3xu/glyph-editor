import { describe, expect, it } from "vitest";
import { pathToSvgD, type SmoothedPath, smoothContour } from "./bezier";
import type { Contour, Point } from "./contour";

// A square contour (4 points)
const SQUARE: Contour = {
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
  isHole: false,
};

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function maxControlDeviation(path: SmoothedPath): number {
  let maxDev = 0;
  for (const seg of path.segments) {
    // Distance of control points from the straight line p0->p3
    const d1 = pointLineDistance(seg.c1, seg.p0, seg.p3);
    const d2 = pointLineDistance(seg.c2, seg.p0, seg.p3);
    maxDev = Math.max(maxDev, d1, d2);
  }
  return maxDev;
}

function pointLineDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return dist(p, a);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

describe("smoothContour (T-015)", () => {
  it("each contiguous fill region produces exactly one closed path", () => {
    const path = smoothContour(SQUARE, 0.5);
    // 4 corners + 4 straight edges = 8 segments
    expect(path.segments.length).toBe(8);
    // Closed: last segment ends at first segment start
    const last = path.segments[path.segments.length - 1]!;
    const first = path.segments[0]!;
    expect(last.p3.x).toBeCloseTo(first.p0.x);
    expect(last.p3.y).toBeCloseTo(first.p0.y);
  });

  it("alpha=0 produces path closely following polygon edges (minimal smoothing)", () => {
    const path = smoothContour(SQUARE, 0);
    const dev = maxControlDeviation(path);
    // With alpha=0, control points should be at the endpoints (zero deviation)
    expect(dev).toBeCloseTo(0, 5);
  });

  it("alpha=1 produces maximally smoothed path", () => {
    const path1 = smoothContour(SQUARE, 1);
    const dev1 = maxControlDeviation(path1);
    // With alpha=1, control points are pulled away from the straight line
    expect(dev1).toBeGreaterThan(0);
  });

  it("intermediate alpha produces proportionally intermediate smoothing", () => {
    const path0 = smoothContour(SQUARE, 0);
    const pathHalf = smoothContour(SQUARE, 0.5);
    const path1 = smoothContour(SQUARE, 1);

    const dev0 = maxControlDeviation(path0);
    const devHalf = maxControlDeviation(pathHalf);
    const dev1 = maxControlDeviation(path1);

    expect(devHalf).toBeGreaterThan(dev0);
    expect(devHalf).toBeLessThan(dev1);
  });

  it("output path is a valid closed curve", () => {
    const path = smoothContour(SQUARE, 0.7);
    expect(path.segments.length).toBeGreaterThan(0);

    // Check connectivity: each segment's end is the next segment's start
    for (let i = 0; i < path.segments.length; i++) {
      const curr = path.segments[i]!;
      const next = path.segments[(i + 1) % path.segments.length]!;
      expect(curr.p3.x).toBeCloseTo(next.p0.x);
      expect(curr.p3.y).toBeCloseTo(next.p0.y);
    }
  });

  it("preserves isHole from input contour", () => {
    const hole: Contour = { ...SQUARE, isHole: true };
    const path = smoothContour(hole, 0.5);
    expect(path.isHole).toBe(true);
  });

  it("fewer than 3 points returns empty segments", () => {
    const tiny: Contour = {
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      isHole: false,
    };
    const path = smoothContour(tiny, 0.5);
    expect(path.segments.length).toBe(0);
  });
});

describe("pathToSvgD", () => {
  it("produces valid SVG path data string ending with Z", () => {
    const path = smoothContour(SQUARE, 0.5);
    const d = pathToSvgD(path);
    expect(d).toMatch(/^M /);
    expect(d).toMatch(/ Z$/);
    expect(d).toContain(" C ");
  });

  it("returns empty string for empty path", () => {
    const path: SmoothedPath = { segments: [], isHole: false };
    expect(pathToSvgD(path)).toBe("");
  });
});
