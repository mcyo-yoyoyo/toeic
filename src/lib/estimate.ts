const ANCHORS: [number, number][] = [
  [0, 5],
  [15, 60],
  [25, 110],
  [35, 160],
  [45, 200],
  [50, 225],
  [55, 255],
  [60, 280],
  [65, 310],
  [70, 345],
  [75, 375],
  [80, 405],
  [85, 430],
  [90, 455],
  [95, 475],
  [100, 495],
];

/** Personal progress marker only. Not an official TOEIC conversion. */
export function estimateFromRaw(correct: number): number {
  const score = Math.max(0, Math.min(100, correct));
  for (let i = 1; i < ANCHORS.length; i++) {
    const [x0, y0] = ANCHORS[i - 1];
    const [x1, y1] = ANCHORS[i];
    if (score <= x1) {
      const t = (score - x0) / (x1 - x0);
      return Math.round(y0 + t * (y1 - y0));
    }
  }
  return 495;
}

export function projectEstimate(
  part5: number | null,
  part6: number | null,
  part7: number | null,
): number | null {
  if (part5 === null || part6 === null || part7 === null) return null;
  const raw = Math.round(part5 * 30 + part6 * 16 + part7 * 54);
  return estimateFromRaw(raw);
}
