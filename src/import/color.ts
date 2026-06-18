/** NOTE: Converts RGB channels to lowercase #rrggbb (no alpha). */
export function rgbaToHex(r: number, g: number, b: number): string {
  const toByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const rr = toByte(r).toString(16).padStart(2, "0");
  const gg = toByte(g).toString(16).padStart(2, "0");
  const bb = toByte(b).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}`;
}
