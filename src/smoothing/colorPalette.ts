function parseHexRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) {
    return [0, 0, 0];
  }
  return [
    Number.parseInt(cleaned.slice(0, 2), 16),
    Number.parseInt(cleaned.slice(2, 4), 16),
    Number.parseInt(cleaned.slice(4, 6), 16),
  ];
}

export function colorDistanceSq(a: string, b: string): number {
  const [ar, ag, ab] = parseHexRgb(a);
  const [br, bg, bb] = parseHexRgb(b);
  const dr = ar - br;
  const dg = ag - bg;
  const db = ab - bb;
  return dr * dr + dg * dg + db * db;
}

export function nearestColorInPalette(color: string, palette: readonly string[]): string {
  if (palette.length === 0) {
    return color;
  }
  let best = palette[0]!;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const candidate of palette) {
    const dist = colorDistanceSq(color, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return best;
}
