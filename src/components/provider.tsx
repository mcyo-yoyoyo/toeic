"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { coachPlan, type CoachPlan } from "@/lib/coach";
import { derive, type Derived } from "@/lib/derive";
import { addDays, todayISO } from "@/lib/dates";
import { createMinimumSession, createPlannedSession, prepareState, toSession } from "@/lib/session";
import { defaultState, isState, loadState, saveState } from "@/lib/storage";
import type { AppState, Baseline, Category, ExamChoice, Goal, Mistake, Part, Reason, TimeMode } from "@/lib/types";
import { estimateFromRaw, projectEstimate } from "@/lib/estimate";
import { planForDate } from "@/lib/plan";

interface BaselineInput {
  part5Correct: number;
  part6Correct: number;
  part7Correct: number;
  part5Total?: number;
  part6Total?: number;
  part7Total?: number;
  source?: "full" | "short";
  totalMinutes: number;
  remainingMinutes: number;
  questionIds?: string[];
  mistakes?: { questionId: string; part: Part; category: string; reason: Reason; notes: string }[];
}

interface DrillInput {
  category: Category;
  questionIds: string[];
  correctIds: string[];
  minutes: number;
  mistakes?: { questionId: string; part: Part; category: string; reason: Reason; notes: string }[];
}

interface Api {
  state: AppState;
  derived: Derived;
  setMode: (mode: TimeMode) => void;
  startMinimum: () => void;
  restorePlan: () => void;
  applyCoach: (input: string) => CoachPlan;
  completeTask: (id: string, log?: { correct: number; total: number; minutes: number }) => void;
  skipTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  saveBaseline: (input: BaselineInput) => void;
  logDrill: (input: DrillInput) => void;
  skipBaseline: () => void;
  addMistake: (input: Omit<Mistake, "id" | "date" | "reviewCount" | "mastered" | "nextReview">) => void;
  reviewMistake: (id: string) => void;
  masterMistake: (id: string, mastered: boolean) => void;
  deleteMistake: (id: string) => void;
  refreshResources: () => void;
  setExamChoice: (choice: ExamChoice) => void;
  confirmRegistration: () => void;
  updateGoal: (goal: Partial<Goal>) => void;
  setName: (name: string) => void;
  resetAll: () => void;
  replaceState: (next: AppState) => void;
}

const Ctx = createContext<Api | null>(null);

export function useStore(): Api {
  const value = useContext(Ctx);
  if (!value) throw new Error("Store is unavailable");
  return value;
}

export function Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => prepareState(defaultState()));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(prepareState(loadState()));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const api = useMemo<Api>(() => {
    const patch = (updater: (current: AppState) => AppState) => {
      setState((current) => updater(current));
    };

    return {
      state,
      derived: derive(state),
      setMode(mode) {
        patch((current) => {
          const today = todayISO();
          const existing = current.sessions[today];
          if (existing?.kind === "baseline" || existing?.kind === "exam") {
            return { ...current, preferredMode: mode, modeTouched: true };
          }
          return {
            ...current,
            preferredMode: mode,
            modeTouched: true,
            sessions: { ...current.sessions, [today]: createPlannedSession(current, today, mode) },
          };
        });
      },
      startMinimum() {
        patch((current) => {
          const today = todayISO();
          return { ...current, sessions: { ...current.sessions, [today]: createMinimumSession(current, today) } };
        });
      },
      restorePlan() {
        patch((current) => {
          const today = todayISO();
          return {
            ...current,
            sessions: { ...current.sessions, [today]: createPlannedSession(current, today, current.preferredMode) },
          };
        });
      },
      applyCoach(input) {
        let result: CoachPlan = coachPlan(input, state, todayISO());
        patch((current) => {
          const today = todayISO();
          result = coachPlan(input, current, today);
          const raw = planForDate(today, {
            baselineDone: current.baseline !== null,
            baselineSkipped: current.baselineSkipped,
            examChoice: current.examChoice,
          });
          const mode: TimeMode = result.minutes <= 20 ? 15 : result.minutes <= 40 ? 30 : result.minutes <= 75 ? 60 : 90;
          const session = toSession(raw, result.tasks, "coach", mode);
          session.date = today;
          session.focus = `优先：${result.priority}`;
          session.why = result.why;
          session.kind = "study";
          session.light = false;
          return { ...current, modeTouched: true, sessions: { ...current.sessions, [today]: session } };
        });
        return result;
      },
      completeTask(id, log) {
        patch((current) => {
          const today = todayISO();
          const session = current.sessions[today];
          const task = session?.tasks.find((item) => item.id === id);
          if (!task) return current;
          const key = `${today}:${id}`;
          const completions = {
            ...current.completions,
            [key]: {
              completed: true,
              completedAt: new Date().toISOString(),
              minutesSpent: log?.minutes ?? task.minutes,
              correct: log?.correct,
              total: log?.total,
            },
          };
          let performance = current.performance;
          if (log && log.total > 0) {
            const entry = {
              id: key,
              date: today,
              day: session.day,
              category: task.category,
              correct: log.correct,
              total: log.total,
              minutes: log.minutes,
            };
            performance = current.performance.some((item) => item.id === key)
              ? current.performance.map((item) => (item.id === key ? entry : item))
              : [...current.performance, entry];
          }
          return { ...current, completions, performance };
        });
      },
      skipTask(id) {
        patch((current) => {
          const today = todayISO();
          return {
            ...current,
            completions: {
              ...current.completions,
              [`${today}:${id}`]: { completed: true, skipped: true, minutesSpent: 0, completedAt: new Date().toISOString() },
            },
          };
        });
      },
      uncompleteTask(id) {
        patch((current) => {
          const today = todayISO();
          const key = `${today}:${id}`;
          const completions = { ...current.completions };
          delete completions[key];
          return {
            ...current,
            completions,
            performance: current.performance.filter((item) => item.id !== key),
          };
        });
      },
      saveBaseline(input) {
        patch((current) => {
          const today = todayISO();
          const part5Total = input.part5Total ?? 30;
          const part6Total = input.part6Total ?? 16;
          const part7Total = input.part7Total ?? 54;
          const readingCorrect = input.part5Correct + input.part6Correct + input.part7Correct;
          const readingTotal = part5Total + part6Total + part7Total;
          const full = part5Total === 30 && part6Total === 16 && part7Total === 54;
          const projected = projectEstimate(
            input.part5Correct / part5Total,
            input.part6Correct / part6Total,
            input.part7Correct / part7Total,
          );
          const baseline: Baseline = {
            part5Correct: input.part5Correct,
            part6Correct: input.part6Correct,
            part7Correct: input.part7Correct,
            part5Total,
            part6Total,
            part7Total,
            source: input.source ?? (full ? "full" : "short"),
            totalMinutes: input.totalMinutes,
            remainingMinutes: input.remainingMinutes,
            readingCorrect,
            estimate: full ? estimateFromRaw(readingCorrect) : (projected ?? estimateFromRaw(readingCorrect)),
            completedAt: new Date().toISOString(),
          };
          const completions = { ...current.completions };
          const session = current.sessions[today];
          if (session?.tasks.some((task) => task.id === "baseline-reading")) {
            completions[`${today}:baseline-reading`] = {
              completed: true,
              completedAt: new Date().toISOString(),
              minutesSpent: input.totalMinutes,
              correct: readingCorrect,
              total: readingTotal,
            };
            completions[`${today}:baseline-log`] = {
              completed: true,
              completedAt: new Date().toISOString(),
              minutesSpent: 5,
            };
          }
          const seenIds = mergeSeen(current.seenIds, input.questionIds ?? []);
          const mistakes = mergeMistakes(current.mistakes, input.mistakes ?? [], today);
          return { ...current, baseline, baselineSkipped: false, completions, seenIds, mistakes };
        });
      },
      skipBaseline() {
        patch((current) => {
          const today = todayISO();
          const next = { ...current, baselineSkipped: true };
          return { ...next, sessions: { ...next.sessions, [today]: createPlannedSession(next, today, next.preferredMode) } };
        });
      },
      logDrill(input) {
        patch((current) => {
          const today = todayISO();
          const seen = new Set(current.seenIds);
          const fresh = input.questionIds.filter((id) => !seen.has(id));
          const freshCorrect = fresh.filter((id) => input.correctIds.includes(id)).length;
          const performance =
            fresh.length === 0
              ? current.performance
              : [
                  ...current.performance,
                  {
                    id: crypto.randomUUID(),
                    date: today,
                    day: current.sessions[today]?.day ?? 0,
                    category: input.category,
                    correct: freshCorrect,
                    total: fresh.length,
                    minutes: input.minutes,
                  },
                ];
          const mistakes = mergeMistakes(current.mistakes, input.mistakes ?? [], today);
          return { ...current, performance, mistakes, seenIds: mergeSeen(current.seenIds, input.questionIds) };
        });
      },
      addMistake(input) {
        patch((current) => {
          const today = todayISO();
          return { ...current, mistakes: mergeMistakes(current.mistakes, [input], today) };
        });
      },
      reviewMistake(id) {
        patch((current) => {
          const today = todayISO();
          return {
            ...current,
            mistakes: current.mistakes.map((item) => {
              if (item.id !== id) return item;
              const intervals = [1, 3, 7, 14, 30];
              const reviewCount = item.reviewCount + 1;
              return {
                ...item,
                reviewCount,
                lastReviewed: today,
                nextReview: addDays(today, intervals[Math.min(reviewCount - 1, intervals.length - 1)] ?? 30),
              };
            }),
          };
        });
      },
      masterMistake(id, mastered) {
        patch((current) => ({
          ...current,
          mistakes: current.mistakes.map((item) => (item.id === id ? { ...item, mastered } : item)),
        }));
      },
      deleteMistake(id) {
        patch((current) => ({ ...current, mistakes: current.mistakes.filter((item) => item.id !== id) }));
      },
      refreshResources() {
        patch((current) => {
          const today = todayISO();
          return {
            ...current,
            resourceCheckedAt: today,
            resourceNote: "已核对。大陆报名和日程以 ETS 托业中国官网为准。门户里的练习是自编的，没有把官方试题放进仓库。",
          };
        });
      },
      setExamChoice(choice) {
        patch((current) => {
          const today = todayISO();
          const next = { ...current, examChoice: choice, registrationConfirmed: false };
          return { ...next, sessions: { ...next.sessions, [today]: createPlannedSession(next, today, next.preferredMode) } };
        });
      },
      confirmRegistration() {
        patch((current) => ({ ...current, registrationConfirmed: true }));
      },
      updateGoal(goal) {
        patch((current) => ({ ...current, goal: { ...current.goal, ...goal } }));
      },
      setName(name) {
        patch((current) => ({ ...current, name }));
      },
      resetAll() {
        setState(prepareState(defaultState()));
      },
      replaceState(next) {
        if (!isState(next)) return;
        setState(prepareState({ ...defaultState(), ...next, goal: { ...defaultState().goal, ...next.goal } }));
      },
    };
  }, [state]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {ready ? null : (
        <div className="fixed inset-0 z-50 grid place-items-center bg-paper px-6 text-ink">
          <p className="font-display text-3xl">正在打开今天的任务</p>
        </div>
      )}
    </Ctx.Provider>
  );
}

function mergeSeen(current: string[] | undefined, ids: string[]): string[] {
  return [...new Set([...(current ?? []), ...ids])];
}

function mergeMistakes(
  current: Mistake[],
  incoming: { questionId: string; part: Part; category: string; reason: Reason; notes: string }[],
  today: string,
): Mistake[] {
  const next = [...current];
  for (const item of incoming) {
    if (!item.questionId) continue;
    const exists = next.some((mistake) => mistake.questionId === item.questionId && !mistake.mastered);
    if (exists) continue;
    next.unshift({
      ...item,
      id: crypto.randomUUID(),
      date: today,
      reviewCount: 0,
      mastered: false,
      nextReview: today,
    });
  }
  return next;
}
