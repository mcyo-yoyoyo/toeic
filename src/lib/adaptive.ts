import { addDays, dateForDay, diffDays, PROGRAM_START } from "./dates";
import type { AppState, Category, Mistake, PerformanceEntry, Reason } from "./types";

export interface Rate {
  correct: number;
  total: number;
}

export interface Signals {
  ready: boolean;
  part5: number | null;
  part6: number | null;
  part7: number | null;
  vocab: number | null;
  grammar: number | null;
  part5Sec: number | null;
  part7Sec: number | null;
  grammarHeavy: boolean;
  preferShort: boolean;
  unfinishedRate: number;
  elapsedDays: number;
  topReason: Reason | null;
  openMistakes: number;
}

export interface Bottle {
  title: string;
  detail: string;
  next: string;
}

const EMPTY: Signals = {
  ready: false,
  part5: null,
  part6: null,
  part7: null,
  vocab: null,
  grammar: null,
  part5Sec: null,
  part7Sec: null,
  grammarHeavy: false,
  preferShort: false,
  unfinishedRate: 0,
  elapsedDays: 0,
  topReason: null,
  openMistakes: 0,
};

export function buildSignals(state: AppState, today: string): Signals {
  const recentFrom = addDays(today, -14);
  const recent = state.performance.filter((item) => item.date >= recentFrom && item.date <= today);
  const baseline = state.baseline;
  const part5 = combine(sum(recent, "part5"), baseline ? { correct: baseline.part5Correct, total: baseline.part5Total ?? 30 } : null);
  const part6 = combine(sum(recent, "part6"), baseline ? { correct: baseline.part6Correct, total: baseline.part6Total ?? 16 } : null);
  const part7 = combine(sum(recent, "part7"), baseline ? { correct: baseline.part7Correct, total: baseline.part7Total ?? 54 } : null);
  const vocab = rateOf(sum(recent, "vocabulary"));
  const grammar = rateOf(sum(recent, "grammar"));
  const open = state.mistakes.filter((item) => !item.mastered);
  const reasonCounts = new Map<Reason, number>();
  for (const item of open) reasonCounts.set(item.reason, (reasonCounts.get(item.reason) ?? 0) + 1);
  let topReason: Reason | null = null;
  let topCount = 0;
  for (const [reason, count] of reasonCounts) {
    if (count > topCount) {
      topReason = reason;
      topCount = count;
    }
  }
  const grammarHeavy = topReason === "grammar" && topCount >= 4;
  const sessions = Object.values(state.sessions).filter((item) => item.date <= today);
  const short = sessions.filter((item) => item.mode === 15 || item.mode === "minimum").length;
  const preferShort = sessions.length >= 4 && short / sessions.length >= 0.6;
  const unfinished = unfinishedStats(state, today);
  const logged = recent.reduce((sumTotal, item) => sumTotal + item.total, 0);
  const ready = Boolean(baseline) || logged >= 12 || open.length >= 4;

  return {
    ready,
    part5: part5 === null ? null : part5.correct / part5.total,
    part6: part6 === null ? null : part6.correct / part6.total,
    part7: part7 === null ? null : part7.correct / part7.total,
    vocab,
    grammar,
    part5Sec: seconds(recent, "part5"),
    part7Sec: seconds(recent, "part7"),
    grammarHeavy,
    preferShort,
    unfinishedRate: unfinished.rate,
    elapsedDays: unfinished.elapsed,
    topReason,
    openMistakes: open.length,
  };
}

export function bottleneck(signals: Signals): Bottle {
  if (!signals.ready) {
    return {
      title: "还没判断",
      detail: "先按本周路线做，并把正确数记下来。",
      next: "维持本周路线",
    };
  }
  if (signals.elapsedDays >= 5 && signals.unfinishedRate >= 0.45) {
    return {
      title: "连续学习",
      detail: "缺的不是新资料，是中间断了。缺的课不补堆到今天。",
      next: "优先 15–30 分钟，做完就算",
    };
  }
  if (signals.vocab !== null && signals.vocab < 0.7) {
    return {
      title: "词汇",
      detail: "认词比例还低于 70%。题海补不上不认识的词。",
      next: "40% 词汇，40% 本周主线，20% 错题",
    };
  }
  if (signals.grammarHeavy || (signals.grammar !== null && signals.grammar < 0.7)) {
    return {
      title: "语法",
      detail: "错因里语法最多，或语法练习还不稳定。",
      next: "50% 语法和 Part 5，30% 词汇，20% 错题",
    };
  }
  if (signals.part5 !== null && signals.part5 < 0.8) {
    return {
      title: "Part 5 正确率",
      detail: "句子题还没稳定到 80%。先不要把时间让给长文章。",
      next: "60% Part 5，20% 词汇，20% 错题",
    };
  }
  if (signals.part5 !== null && signals.part5 >= 0.85 && signals.part5Sec !== null && signals.part5Sec > 40) {
    return {
      title: "Part 5 速度",
      detail: "正确率已经够，单题仍然偏慢。",
      next: "限时 Part 5，不再加题量",
    };
  }
  if (signals.part6 !== null && signals.part6 < 0.7) {
    return {
      title: "Part 6",
      detail: "短文填空还没稳住。先读整段，再看空格。",
      next: "50% Part 6，30% Part 5，20% 错题",
    };
  }
  if (signals.part7 !== null && signals.part7 < 0.65) {
    return {
      title: "Part 7 正确率",
      detail: "阅读正确率还低于 65%。先保证看懂，再谈整套速度。",
      next: "60% Part 7，20% 词汇，20% 错题",
    };
  }
  if (signals.part7Sec !== null && signals.part7Sec > 90) {
    return {
      title: "Part 7 速度",
      detail: "文章题单题耗时偏高。用短时限，不要再加篇数。",
      next: "60% 限时 Part 7，20% 词汇，20% 错题",
    };
  }
  return {
    title: "没有单项塌陷",
    detail: "按本周路线继续，把到期错题清掉。",
    next: "按本周路线",
  };
}

export function weekRates(entries: PerformanceEntry[]) {
  return {
    part5: rateOf(sum(entries, "part5")),
    part6: rateOf(sum(entries, "part6")),
    part7: rateOf(sum(entries, "part7")),
    vocab: rateOf(sum(entries, "vocabulary")),
    grammar: rateOf(sum(entries, "grammar")),
    part5Sec: seconds(entries, "part5"),
    part7Sec: seconds(entries, "part7"),
    questions: entries.reduce((total, item) => total + item.total, 0),
  };
}

function unfinishedStats(state: AppState, today: string): { rate: number; elapsed: number } {
  const dates = Object.keys(state.sessions).filter((date) => date >= PROGRAM_START && date < today);
  const firstStudy = Object.entries(state.completions)
    .filter(([, value]) => value.completed && !value.skipped)
    .map(([key]) => key.slice(0, 10))
    .sort()[0];
  const relevant = dates.filter((date) => !firstStudy || date >= firstStudy);
  if (relevant.length === 0) return { rate: 0, elapsed: diffDays(PROGRAM_START, today) > 0 ? 0 : 0 };
  let missed = 0;
  for (const date of relevant) {
    const session = state.sessions[date];
    const done = session.tasks.every((task) => state.completions[`${date}:${task.id}`]?.completed);
    if (!done) missed += 1;
  }
  return { rate: missed / relevant.length, elapsed: relevant.length };
}

function sum(entries: PerformanceEntry[], category: Category): Rate | null {
  const rows = entries.filter((item) => item.category === category && item.total > 0);
  if (rows.length === 0) return null;
  return {
    correct: rows.reduce((total, item) => total + item.correct, 0),
    total: rows.reduce((total, item) => total + item.total, 0),
  };
}

function combine(recent: Rate | null, base: Rate | null): Rate | null {
  if (recent && recent.total >= 8) return recent;
  if (recent && base) return { correct: recent.correct + base.correct, total: recent.total + base.total };
  return recent ?? base;
}

function rateOf(input: Rate | null): number | null {
  if (!input || input.total <= 0) return null;
  return input.correct / input.total;
}

function seconds(entries: PerformanceEntry[], category: Category): number | null {
  const rows = entries.filter((item) => item.category === category && item.total > 0 && item.minutes > 0);
  const total = rows.reduce((sumTotal, item) => sumTotal + item.total, 0);
  const minutes = rows.reduce((sumTotal, item) => sumTotal + item.minutes, 0);
  if (total < 5) return null;
  return (minutes * 60) / total;
}

export function topReason(mistakes: Mistake[]): Reason | null {
  const counts = new Map<Reason, number>();
  for (const item of mistakes) {
    if (item.mastered) continue;
    counts.set(item.reason, (counts.get(item.reason) ?? 0) + 1);
  }
  let best: Reason | null = null;
  let n = 0;
  for (const [reason, count] of counts) {
    if (count > n) {
      best = reason;
      n = count;
    }
  }
  return best;
}

export function weekStart(week: number): string {
  return dateForDay((week - 1) * 7 + 1);
}
