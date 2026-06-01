import { describe, expect, it } from "vitest";
import { clampAlphaThreshold, imageDataToCells } from "./imageToGrid";

function makeImageData(gridSize: number, fill: (row: number, col: number) => [number, number, number, number]): ImageData {
  const data = new Uint8ClampedArray(gridSize * gridSize * 4);
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const [r, g, b, a] = fill(row, col);
      const i = (row * gridSize + col) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return { width: gridSize, height: gridSize, data } as ImageData;
}

describe("imageDataToCells", () => {
  it("maps opaque pixels to filled cells with hex colors", () => {
    const imageData = makeImageData(2, (row, col) =>
      row === 0 && col === 1 ? [255, 0, 0, 255] : [0, 0, 0, 0],
    );
    const cells = imageDataToCells(imageData, 2, 128);
    expect(cells[1]).toEqual({ filled: true, color: "#ff0000" });
    expect(cells[0]).toEqual({ filled: false, color: undefined });
    expect(cells[2]).toEqual({ filled: false, color: undefined });
    expect(cells[3]).toEqual({ filled: false, color: undefined });
  });

  it("respects alpha threshold boundary", () => {
    const imageData = makeImageData(1, () => [10, 20, 30, 127]);
    expect(imageDataToCells(imageData, 1, 128)[0]).toEqual({ filled: false, color: undefined });

    const imageData2 = makeImageData(1, () => [10, 20, 30, 128]);
    expect(imageDataToCells(imageData2, 1, 128)[0]?.filled).toBe(true);
    expect(imageDataToCells(imageData2, 1, 128)[0]?.color).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("clampAlphaThreshold", () => {
  it("clamps to 0-255", () => {
    expect(clampAlphaThreshold(-5)).toBe(0);
    expect(clampAlphaThreshold(300)).toBe(255);
    expect(clampAlphaThreshold(64.7)).toBe(65);
  });
});
