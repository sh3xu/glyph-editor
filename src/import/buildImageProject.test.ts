import { describe, expect, it } from "vitest";
import { parseProjectDocument } from "../samples/schema";
import { buildImageProjectDocument, IMPORTED_LAYER_ID } from "./buildImageProject";

describe("buildImageProjectDocument", () => {
  it("produces a document that passes schema validation", () => {
    const gridSize = 8;
    const cells = Array.from({ length: gridSize * gridSize }, (_, index) =>
      index === 0
        ? { filled: true, color: "#ff0000" }
        : index === gridSize * gridSize - 1
          ? { filled: true, color: "#00ff00" }
          : { filled: false, color: undefined },
    );
    const doc = buildImageProjectDocument(cells, gridSize);
    const parsed = parseProjectDocument(doc);
    expect(parsed.gridSize).toBe(gridSize);
    expect(parsed.layers).toHaveLength(1);
    expect(parsed.layers[0]!.id).toBe(IMPORTED_LAYER_ID);
    expect(parsed.layers[0]!.cells[0]).toBe("#ff0000");
    expect(parsed.layers[0]!.cells[cells.length - 1]).toBe("#00ff00");
    expect(parsed.activeLayerId).toBe(IMPORTED_LAYER_ID);
  });
});
