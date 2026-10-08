import type { AppState, ExamChoice } from "./types";

const KEY = "toeic-300-os-v1";

/**
 * MVP store. Later, replace loadState/saveState with the same AppState shape
 * for Supabase, cloud sync, or an AI coach. Do not add those services here.
 */
export function defaultState(): AppState {
  return {
    version: 1,
    goal: { targetScore: 300, targetDate: "2026-12-20" },
    baseline: null,
    baselineSkipped: false,
    completions: {},
    sessions: {},
    performance: [],
    mistakes: [],
    seenIds: [],
    preferredMode: 60,
    modeTouched: false,
    resourceCheckedAt: null,
    resourceNote: null,
    examChoice: null,
    registrationConfirmed: false,
    name: "",
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState> & { examChoice?: string; goal?: { targetDate?: string } };
    if (parsed.version !== 1) return defaultState();
    const goal = { ...defaultState().goal, ...parsed.goal };
    if (goal.targetDate === "2026-12-19") goal.targetDate = "2026-12-20";
    return {
      ...defaultState(),
      ...parsed,
      goal,
      examChoice: normalizeChoice(parsed.examChoice),
      completions: parsed.completions ?? {},
      sessions: parsed.sessions ?? {},
      performance: parsed.performance ?? [],
      mistakes: parsed.mistakes ?? [],
      seenIds: parsed.seenIds ?? [],
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function isState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<AppState>;
  return state.version === 1 && Boolean(state.goal) && Array.isArray(state.mistakes);
}

function normalizeChoice(value: string | null | undefined): ExamChoice | null {
  if (value === "dec20" || value === "nov22" || value === "both" || value === "later") return value;
  if (value === "dec19") return "dec20";
  if (value === "dec6") return "nov22";
  return null;
}
