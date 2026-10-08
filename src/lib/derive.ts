import { bottleneck, buildSignals, weekRates, type Bottle, type Signals } from "./adaptive";
import {
  addDays,
  dateForDay,
  diffDays,
  EARLY_DEADLINE,
  EARLY_EXAM,
  EARLY_RUSH,
  EXAM_DATE,
  EXAM_DEADLINE,
  EXAM_RUSH,
  OCT_RUSH,
  formatCN,
  formatShort,
  programDay,
  todayISO,
} from "./dates";
import { estimateFromRaw, projectEstimate } from "./estimate";
import { pct } from "./labels";
import { REASON_LABEL } from "./labels";
import { planForDate, WEEK_META } from "./plan";
import type { AppState, Completion, DayPlan, Mistake, PlannedTask, SessionTask } from "./types";

export interface WeekReview {
  week: number;
  title: string;
  dates: string;
  consistency: string;
  vocab: string;
  grammar: string;
  part5: string;
  part6: string;
  part7: string;
  speed: string;
  estimate: number | null;
  bottle: Bottle;
  partial: boolean;
}

export interface Deadline {
  title: string;
  detail: string;
}

export interface Derived {
  today: string;
  todayLabel: string;
  dayNumber: number;
  plan: DayPlan;
  tasks: SessionTask[];
  minutes: number;
  done: number;
  allDone: boolean;
  next: SessionTask | null;
  nextLabel: string;
  streak: number;
  estimate: number | null;
  parts: Signals;
  bottle: Bottle;
  programPercent: number;
  studiedMinutes: number;
  completedTasks: number;
  tomorrow: DayPlan | null;
  todayMinutes: number;
  todayAccuracy: { correct: number; total: number } | null;
  todayMistakes: number;
  todayWeak: string;
  weekReview: WeekReview | null;
  reviews: WeekReview[];
  deadline: Deadline | null;
  examCountdown: number;
  needsBaselineBanner: boolean;
  book13Live: boolean;
}

export function derive(state: AppState, today = todayISO()): Derived {
  const session = state.sessions[today];
  const plan = planForDate(today, {
    baselineDone: state.baseline !== null,
    baselineSkipped: state.baselineSkipped,
    examChoice: state.examChoice,
  });
  const tasks = hydrate(session?.tasks ?? plan.tasks, state.completions, session?.date ?? today);
  const done = tasks.filter((task) => task.completed).length;
  const allDone = tasks.length > 0 && done === tasks.length;
  const next = tasks.find((task) => !task.completed) ?? null;
  const dayNumber = programDay(today);
  const tomorrowDate = addDays(today, 1);
  const tomorrow = planForDate(tomorrowDate, {
    baselineDone: state.baseline !== null,
    baselineSkipped: state.baselineSkipped,
    examChoice: state.examChoice,
  });
  const parts = buildSignals(state, today);
  const bottle = bottleneck(parts);
  const streak = streakCount(state, today);
  const estimate = currentEstimate(state, parts);
  const todayMistakes = state.mistakes.filter((item) => item.date === today);
  const todayWeak = weakToday(todayMistakes, bottle.title);
  const reviews = buildReviews(state, today);
  const weekReview = dayNumber > 0 && dayNumber % 7 === 0 ? (reviews.find((item) => item.week === dayNumber / 7) ?? null) : null;

  return {
    today,
    todayLabel: formatCN(today),
    dayNumber,
    plan: session
      ? {
          ...plan,
          focus: session.focus,
          why: session.why,
          phase: session.phase,
          kind: session.kind,
          light: session.light,
          tasks: session.tasks,
        }
      : plan,
    tasks,
    minutes: tasks.reduce((sum, task) => sum + task.minutes, 0),
    done,
    allDone,
    next,
    nextLabel: allDone ? `今天可以停了。明天：${tomorrow.focus}` : `${next?.title ?? "今天的任务"} · ${next?.minutes ?? 0} 分钟`,
    streak,
    estimate,
    parts,
    bottle,
    programPercent: programPercent(state, today),
    studiedMinutes: Object.values(state.completions).reduce((sum, item) => sum + (item.skipped ? 0 : item.minutesSpent ?? 0), 0),
    completedTasks: Object.values(state.completions).filter((item) => item.completed && !item.skipped).length,
    tomorrow,
    todayMinutes: tasks.reduce((sum, task) => sum + (task.completed && !task.skipped ? task.minutesSpent ?? task.minutes : 0), 0),
    todayAccuracy: accuracyOf(tasks),
    todayMistakes: todayMistakes.length,
    todayWeak,
    weekReview,
    reviews,
    deadline: deadlineFor(state, today),
    examCountdown: diffDays(today, state.goal.targetDate),
    needsBaselineBanner: dayNumber >= 1 && state.baseline === null && !state.baselineSkipped,
    book13Live: today >= "2026-10-19",
  };
}

export function dueMistakes(mistakes: Mistake[], today: string): Mistake[] {
  return mistakes
    .filter((item) => !item.mastered && item.nextReview <= today)
    .sort((a, b) => a.nextReview.localeCompare(b.nextReview));
}

function hydrate(tasks: PlannedTask[], completions: Record<string, Completion>, date: string): SessionTask[] {
  return tasks.map((task) => {
    const saved = completions[`${date}:${task.id}`];
    return {
      ...task,
      completed: Boolean(saved?.completed),
      skipped: saved?.skipped,
      correct: saved?.correct,
      total: saved?.total,
      minutesSpent: saved?.minutesSpent,
    };
  });
}

function accuracyOf(tasks: SessionTask[]): { correct: number; total: number } | null {
  const rows = tasks.filter((task) => task.completed && task.total && task.total > 0);
  if (rows.length === 0) return null;
  return {
    correct: rows.reduce((sum, task) => sum + (task.correct ?? 0), 0),
    total: rows.reduce((sum, task) => sum + (task.total ?? 0), 0),
  };
}

function streakCount(state: AppState, today: string): number {
  const studied = (date: string) =>
    Object.entries(state.completions).some(([key, value]) => key.startsWith(`${date}:`) && value.completed && !value.skipped);
  let cursor = studied(today) ? today : addDays(today, -1);
  if (!studied(cursor)) return 0;
  let days = 0;
  while (studied(cursor) && days < 400) {
    days += 1;
    cursor = addDays(cursor, -1);
  }
  return days;
}

function currentEstimate(state: AppState, signals: Signals): number | null {
  const mocks = state.performance.filter((item) => item.category === "mock" && item.total >= 40);
  const latest = mocks[mocks.length - 1];
  if (latest) return estimateFromRaw(Math.round((latest.correct / latest.total) * 100));
  if (state.baseline) return state.baseline.estimate;
  return projectEstimate(signals.part5, signals.part6, signals.part7);
}

function programPercent(state: AppState, today: string): number {
  let doneDays = 0;
  for (let day = 1; day <= 56; day += 1) {
    const date = dateForDay(day);
    if (date > today) break;
    const session = state.sessions[date];
    if (!session) continue;
    const complete = session.tasks.every((task) => state.completions[`${date}:${task.id}`]?.completed);
    if (complete) doneDays += 1;
  }
  return Math.round((doneDays / 56) * 100);
}

function weakToday(mistakes: Mistake[], fallback: string): string {
  if (mistakes.length === 0) return fallback;
  const counts = new Map<string, number>();
  for (const item of mistakes) {
    const label = REASON_LABEL[item.reason];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
}

function deadlineFor(state: AppState, today: string): Deadline | null {
  if (state.registrationConfirmed) return null;
  const choice = state.examChoice;
  if (choice === "nov22" && today > EARLY_EXAM) return null;
  if (today > EXAM_DATE) return null;

  if (today <= OCT_RUSH && (choice === null || choice === "later")) {
    return {
      title: "10 月 25 日大陆场，加急报名 10 月 15 日截止",
      detail: "常规报名已在 9 月 28 日结束。56 天主计划对准 12 月 20 日。10 月 25 日只适合现在就能上场的人。11 月 22 日常规报名到 10 月 26 日。",
    };
  }
  if (today <= EARLY_DEADLINE && choice !== "dec20") {
    return {
      title: "11 月 22 日大陆听读场，常规报名 10 月 26 日截止",
      detail:
        choice === "nov22"
          ? "这是你选的考试日。到 ETS 托业中国官网确认缴费成功，再点已报名。"
          : "主目标是 12 月 20 日，常规报名到 11 月 23 日。11 月 22 日可以当作提前一场。加急报名到 11 月 12 日。",
    };
  }
  if (today <= EARLY_RUSH && (choice === "nov22" || choice === "both")) {
    return {
      title: "11 月 22 日场加急报名到 11 月 12 日",
      detail: "常规报名已过。加急可以报，但不能退费。12 月 20 日场仍可常规报名到 11 月 23 日。",
    };
  }
  if (today <= EXAM_DEADLINE && choice !== "nov22") {
    return {
      title: "12 月 20 日大陆听读场，常规报名 11 月 23 日截止",
      detail: "这是门户默认的目标考试日。报名以 ETS 托业中国官网为准。加急报名到 12 月 10 日。",
    };
  }
  if (today <= EXAM_RUSH && choice !== "later" && choice !== "nov22") {
    return {
      title: "12 月 20 日场加急报名到 12 月 10 日",
      detail: "常规报名已过。加急报名不能退费。报完再点已报名。",
    };
  }
  if (choice !== "later") {
    return {
      title: "12 月 20 日场的报名截止已经过了",
      detail: "如果没报上，打开大陆官网看下一场，并在设置里改目标日期。",
    };
  }
  return null;
}

function buildReviews(state: AppState, today: string): WeekReview[] {
  const day = programDay(today);
  if (day <= 0) return [];
  const max = Math.min(8, Math.ceil(Math.min(day, 56) / 7));
  const reviews: WeekReview[] = [];
  for (let week = 1; week <= max; week += 1) reviews.push(reviewWeek(state, week, today));
  return reviews;
}

function reviewWeek(state: AppState, week: number, today: string): WeekReview {
  const start = dateForDay((week - 1) * 7 + 1);
  const end = dateForDay(week * 7);
  const meta = WEEK_META[week];
  const entries = state.performance.filter((item) => item.date >= start && item.date <= end && item.date <= today);
  const rates = weekRates(entries);
  let studied = 0;
  let possible = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const date = addDays(start, offset);
    if (date > today) continue;
    possible += 1;
    const session = state.sessions[date];
    const did = session?.tasks.some((task) => {
      const saved = state.completions[`${date}:${task.id}`];
      return saved?.completed && !saved.skipped;
    });
    if (did) studied += 1;
  }
  const partial = today < end;
  const bottle =
    rates.questions < 8
      ? { title: "这周记录不够", detail: "做题时记下正确数，周末才能判断要不要改下一周。", next: "先维持本周路线" }
      : bottleneck({
          ...buildSignals(state, today),
          ready: true,
          part5: rates.part5,
          part6: rates.part6,
          part7: rates.part7,
          vocab: rates.vocab,
          grammar: rates.grammar,
          part5Sec: rates.part5Sec,
          part7Sec: rates.part7Sec,
        });
  const mock = entries.filter((item) => item.category === "mock" && item.total >= 40).at(-1);
  const estimate = mock
    ? estimateFromRaw(Math.round((mock.correct / mock.total) * 100))
    : projectEstimate(rates.part5, rates.part6, rates.part7);
  const speed = [
    rates.part5Sec ? `Part 5 约 ${Math.round(rates.part5Sec)} 秒/题` : null,
    rates.part7Sec ? `Part 7 约 ${Math.round(rates.part7Sec)} 秒/题` : null,
  ]
    .filter(Boolean)
    .join("，");

  return {
    week,
    title: meta?.title ?? `第 ${week} 周`,
    dates: `${formatShort(start)} – ${formatShort(end)}`,
    consistency: possible === 0 ? "还没开始" : `${studied}/${possible} 天有学习`,
    vocab: pct(rates.vocab),
    grammar: pct(rates.grammar),
    part5: pct(rates.part5),
    part6: pct(rates.part6),
    part7: pct(rates.part7),
    speed: speed || "还没有计时记录",
    estimate,
    bottle,
    partial,
  };
}

export function coreDayLabel(dayNumber: number, today: string): string {
  if (dayNumber <= 0) return "10/12 开始，共 56 天";
  if (dayNumber <= 56) return `第 ${dayNumber} 天 / 56`;
  if (today <= EXAM_DATE) return "缓冲期";
  return "主计划已结束";
}
