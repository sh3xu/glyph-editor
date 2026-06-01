import { describe, expect, it } from "vitest";
import { Grid } from "../models/grid";
import { nearestColorInPalette } from "./colorPalette";
import { buildColorExtractionGroups } from "./multicolor";

describe("nearestColorInPalette", () => {
  it("picks the closest rgb color", () => {
    expect(nearestColorInPalette("#ff0000", ["#0000ff", "#ff0101"])).toBe("#ff0101");
  });
});

describe("buildColorExtractionGroups", () => {
  it("merges overflow colors into nearest primary by frequency", () => {
    const grid = new Grid(8);
    grid.initLayer("l1");
    grid.fillCell("l1", 0, 0, "#ff0000");
    grid.fillCell("l1", 0, 1, "#ff0000");
    grid.fillCell("l1", 1, 0, "#0000ff");
    grid.fillCell("l1", 1, 1, "#0000ff");
    grid.fillCell("l1", 2, 0, "#00ff00");

    const groups = buildColorExtractionGroups(grid, "l1", 2);
    expect(groups).toHaveLength(2);

    const redGroup = groups.find((g) => g.representative === "#ff0000");
    const blueGroup = groups.find((g) => g.representative === "#0000ff");
    expect(redGroup?.matchColors.has("#ff0000")).toBe(true);
    expect(blueGroup?.matchColors.has("#0000ff")).toBe(true);
    expect(blueGroup?.matchColors.has("#00ff00")).toBe(true);
  });
});
