import { describe, expect, it } from "vitest";
import { computeFitRects } from "./fitRects";

describe("computeFitRects", () => {
  it("contain centers a wide image with letterboxing", () => {
    const r = computeFitRects(8, 4, 16, "contain");
    expect(r.dw).toBe(16);
    expect(r.dh).toBe(8);
    expect(r.dx).toBe(0);
    expect(r.dy).toBe(4);
  });

  it("contain centers a tall image with letterboxing", () => {
    const r = computeFitRects(4, 8, 16, "contain");
    expect(r.dw).toBe(8);
    expect(r.dh).toBe(16);
    expect(r.dx).toBe(4);
    expect(r.dy).toBe(0);
  });

  it("cover scales to fill and may extend past grid edges", () => {
    const r = computeFitRects(8, 4, 16, "cover");
    expect(r.dw).toBe(32);
    expect(r.dh).toBe(16);
    expect(r.dx).toBe(-8);
    expect(r.dy).toBe(0);
  });

  it("cover on tall image crops vertically via dest offset", () => {
    const r = computeFitRects(4, 8, 16, "cover");
    expect(r.dw).toBe(16);
    expect(r.dh).toBe(32);
    expect(r.dx).toBe(0);
    expect(r.dy).toBe(-8);
  });
});
