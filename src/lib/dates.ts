export const PROGRAM_START = "2026-10-12";
export const PROGRAM_END = "2026-12-06";
/** 中国大陆 2026 年 12 月听力阅读公开考试。 */
export const EXAM_DATE = "2026-12-20";
/** 中国大陆 2026 年 11 月听力阅读公开考试，可作提前一场。 */
export const EARLY_EXAM = "2026-11-22";
/** 中国大陆 2026 年 10 月听力阅读公开考试。常规报名已过，只剩加急。 */
export const OCT_EXAM = "2026-10-25";
export const OCT_RUSH = "2026-10-15";
export const EARLY_DEADLINE = "2026-10-26";
export const EARLY_RUSH = "2026-11-12";
export const EXAM_DEADLINE = "2026-11-23";
export const EXAM_RUSH = "2026-12-10";
export const BUFFER_END = "2026-12-31";

export function todayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: string, days: number): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

export function diffDays(from: string, to: string): number {
  return Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86400000);
}

export function programDay(today: string): number {
  const delta = diffDays(PROGRAM_START, today);
  if (delta < 0) return 0;
  return delta + 1;
}

export function dateForDay(day: number): string {
  return addDays(PROGRAM_START, day - 1);
}

export function formatCN(iso: string): string {
  const date = parseISO(iso);
  const weeks = ["日", "一", "二", "三", "四", "五", "六"];
  return `${date.getMonth() + 1}月${date.getDate()}日 周${weeks[date.getDay()]}`;
}

export function formatShort(iso: string): string {
  const date = parseISO(iso);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function pad(n: number): string {
  return String(n).padStart(3, "0");
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
