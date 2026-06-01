import { describe, expect, it } from "vitest";
import { rgbaToHex } from "./color";

describe("rgbaToHex", () => {
  it("formats pure red", () => {
    expect(rgbaToHex(255, 0, 0)).toBe("#ff0000");
  });

  it("clamps and rounds channels", () => {
    expect(rgbaToHex(254.6, 0, -5)).toBe("#ff0000");
  });

  it("formats mid gray", () => {
    expect(rgbaToHex(128, 128, 128)).toBe("#808080");
  });
});
