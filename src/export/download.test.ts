import { describe, expect, it } from "vitest";
import { generateFilename } from "./download";

describe("generateFilename (T-022)", () => {
  it("SVG filename is descriptive", () => {
    expect(generateFilename("svg")).toBe("logo.svg");
  });

  it("PNG filename includes scale info", () => {
    expect(generateFilename("png", { scale: 1 })).toBe("logo-1x.png");
    expect(generateFilename("png", { scale: 2 })).toBe("logo-2x.png");
    expect(generateFilename("png", { scale: 4 })).toBe("logo-4x.png");
  });

  it("filenames distinguish between modes", () => {
    const light = generateFilename("svg", { mode: "light" });
    const dark = generateFilename("svg", { mode: "dark" });
    expect(light).not.toBe(dark);
    expect(light).toContain("light");
    expect(dark).toContain("dark");
  });

  it("custom base name is used", () => {
    expect(generateFilename("svg", { baseName: "mylogo" })).toBe("mylogo.svg");
  });

  it("1x and 4x PNG filenames are distinguishable", () => {
    const f1 = generateFilename("png", { scale: 1 });
    const f4 = generateFilename("png", { scale: 4 });
    expect(f1).not.toBe(f4);
  });
});
