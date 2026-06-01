export type SmoothingMode = "none" | "pixel" | "squircle" | "smooth";

export function usesRawGridStyling(mode: SmoothingMode): boolean {
  return mode === "none";
}
