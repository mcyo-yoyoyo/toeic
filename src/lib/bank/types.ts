export interface VocabCard {
  id: string;
  word: string;
  pos: string;
  meaning: string;
  example: string;
}

export interface Choice {
  id: string;
  stem: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
}

export interface ReadingSet {
  id: string;
  kind: "part6" | "part7" | "part7-multi";
  title: string;
  passage: string;
  questions: Choice[];
}

export type PracticeSet = "vocab" | "part5" | "part6" | "part7" | "part7-multi" | "diagnostic";

export function isPracticeSet(value: string): value is PracticeSet {
  return value === "vocab" || value === "part5" || value === "part6" || value === "part7" || value === "part7-multi" || value === "diagnostic";
}

export function deck<T>(items: T[], day: number, count: number, salt = 0): T[] {
  if (items.length === 0 || count <= 0) return [];
  const size = Math.min(count, items.length);
  const start = Math.abs((Math.max(day, 1) + salt) * size) % items.length;
  return Array.from({ length: size }, (_, index) => items[(start + index) % items.length]);
}
