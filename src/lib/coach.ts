import { buildSignals, bottleneck } from "./adaptive";
import { clamp } from "./dates";
import { CATEGORY_LABEL, pct } from "./labels";
import type { AppState, Category, PlannedTask } from "./types";

export interface CoachPlan {
  minutes: number;
  heard: boolean;
  priority: string;
  why: string;
  tasks: PlannedTask[];
}

export function coachPlan(input: string, state: AppState, today: string): CoachPlan {
  const heardMinutes = parseMinutes(input);
  const minutes = heardMinutes ?? 25;
  const signals = buildSignals(state, today);
  const bottle = bottleneck(signals);
  const main = signals.ready ? categoryFromBottle(bottle.title) : "part5";
  const second = weaknessOrder(signals).find((category) => category !== main) ?? "review";
  const tasks = blocksFor(minutes, main, second);
  return {
    minutes,
    heard: heardMinutes !== null,
    priority: CATEGORY_LABEL[main],
    why: explain(signals, main, minutes, heardMinutes !== null),
    tasks,
  };
}

export function parseMinutes(input: string): number | null {
  const text = input.trim().toLowerCase();
  if (!text) return null;
  if (/一个半|1\.5/.test(text) && /小时/.test(text)) return 90;
  if (/半小时|三十分钟|30\s*分钟/.test(text)) return 30;
  if (/一刻钟|十五分钟|15\s*分钟/.test(text)) return 15;
  if (/一小时|60\s*分钟|1\s*小时/.test(text) && !/半/.test(text)) return 60;
  const match = text.match(/(\d+)\s*(分钟|分|min|minutes|小时|hours|hour)/i);
  if (match) {
    let value = Number(match[1]);
    if (/小时|hour/.test(match[2] ?? "") && value <= 5) value *= 60;
    if (value >= 5 && value <= 180) return clamp(value, 10, 120);
  }
  if (/^\d+$/.test(text)) {
    const value = Number(text);
    if (value >= 10 && value <= 180) return clamp(value, 10, 120);
  }
  return null;
}

function categoryFromBottle(title: string): Category {
  if (title.includes("词汇")) return "vocabulary";
  if (title.includes("语法")) return "grammar";
  if (title.includes("Part 6")) return "part6";
  if (title.includes("Part 7")) return "part7";
  if (title.includes("连续")) return "vocabulary";
  return "part5";
}

function weaknessOrder(signals: ReturnType<typeof buildSignals>): Category[] {
  const rows: { category: Category; score: number }[] = [];
  if (signals.part7 !== null) rows.push({ category: "part7", score: signals.part7 });
  if (signals.part6 !== null) rows.push({ category: "part6", score: signals.part6 });
  if (signals.part5 !== null) rows.push({ category: "part5", score: signals.part5 });
  if (signals.vocab !== null) rows.push({ category: "vocabulary", score: signals.vocab });
  if (signals.grammarHeavy) rows.unshift({ category: "grammar", score: 0.4 });
  rows.sort((a, b) => a.score - b.score);
  const order = rows.map((row) => row.category);
  for (const category of ["part7", "part5", "vocabulary", "review"] as Category[]) {
    if (!order.includes(category)) order.push(category);
  }
  return order;
}

function blocksFor(minutes: number, main: Category, second: Category): PlannedTask[] {
  if (minutes <= 16) {
    if (main === "part7") {
      return [
        block("vocabulary", 4, 8),
        block("part7", 8, 1),
        block("review", Math.max(3, minutes - 12), 2),
      ];
    }
    return [block("vocabulary", 5, 10), block("part5", 5, 5), block("review", 5, 3)];
  }

  const vocabMinutes = main === "vocabulary" ? Math.round(minutes * 0.45) : Math.min(8, Math.round(minutes * 0.18));
  const reviewMinutes = Math.min(8, Math.max(4, Math.round(minutes * 0.15)));
  let mainMinutes = minutes - (main === "vocabulary" ? 0 : vocabMinutes) - reviewMinutes;
  if (mainMinutes < 8) mainMinutes = Math.max(8, minutes - reviewMinutes);
  const tasks: PlannedTask[] = [];
  if (main !== "vocabulary") tasks.push(block("vocabulary", vocabMinutes, vocabMinutes >= 8 ? 15 : 10));
  tasks.push(block(main, mainMinutes, quantityFor(main, mainMinutes)));
  if (second !== main && minutes >= 30) {
    const secondMinutes = Math.max(6, Math.round(mainMinutes * 0.35));
    if (tasks.reduce((sum, task) => sum + task.minutes, 0) + secondMinutes + reviewMinutes <= minutes + 2) {
      tasks.push(block(second, secondMinutes, quantityFor(second, secondMinutes)));
    }
  }
  tasks.push(block("review", reviewMinutes, reviewMinutes >= 8 ? 4 : 2));
  return fit(tasks, minutes);
}

function quantityFor(category: Category, minutes: number): number {
  if (category === "vocabulary") return Math.max(8, minutes * 2);
  if (category === "part7") return minutes >= 25 ? 2 : 1;
  if (category === "part6") return Math.max(4, Math.round(minutes / 2));
  if (category === "grammar") return Math.max(5, Math.round(minutes * 0.7));
  if (category === "review") return Math.max(2, Math.round(minutes / 3));
  return Math.max(5, minutes);
}

function block(category: Category, minutes: number, quantity: number): PlannedTask {
  const safeMinutes = Math.max(4, minutes);
  if (category === "vocabulary") {
    return {
      id: "coach-vocabulary",
      category,
      title: `${quantity} 个词`,
      detail: "先过词，不展开。",
      minutes: safeMinutes,
      quantity,
      unit: "words",
      resourceId: "offline-vocab",
      importance: 1,
    };
  }
  if (category === "part7") {
    return {
      id: "coach-part7",
      category,
      title: quantity > 1 ? `Part 7 · ${quantity} 篇` : "Part 7 · 1 篇",
      detail: "时间不够做完整套阅读，只做短的。做完就停。",
      minutes: safeMinutes,
      quantity,
      unit: "passages",
      target: "记下用时",
      resourceId: "offline-part7",
      importance: 1,
    };
  }
  if (category === "part6") {
    return {
      id: "coach-part6",
      category,
      title: `Part 6 · ${quantity} 题`,
      detail: "先读整段再填。",
      minutes: safeMinutes,
      quantity,
      unit: "questions",
      resourceId: "offline-part6",
      importance: 1,
    };
  }
  if (category === "grammar") {
    return {
      id: "coach-grammar",
      category,
      title: `语法 · ${quantity} 题`,
      detail: "只做最近错得最多的那一种语法。",
      minutes: safeMinutes,
      quantity,
      unit: "questions",
      resourceId: "offline-part5",
      importance: 1,
    };
  }
  if (category === "review") {
    return {
      id: "coach-review",
      category,
      title: `复习 ${quantity} 条错题`,
      detail: "没有错题就跳过。",
      minutes: safeMinutes,
      quantity,
      unit: "mistakes",
      resourceId: "internal-mistakes",
      href: "/mistakes",
      importance: 1,
    };
  }
  return {
    id: "coach-part5",
    category: "part5",
    title: `Part 5 · ${quantity} 题`,
    detail: "做完标错因，不加下一组。",
    minutes: safeMinutes,
    quantity,
    unit: "questions",
    resourceId: "offline-part5",
    importance: 1,
  };
}

function fit(tasks: PlannedTask[], budget: number): PlannedTask[] {
  const total = tasks.reduce((sum, task) => sum + task.minutes, 0);
  if (total === budget || tasks.length === 0) return tasks;
  const copy = tasks.map((task) => ({ ...task }));
  copy[copy.length - 1].minutes = Math.max(3, copy[copy.length - 1].minutes + (budget - total));
  return copy;
}

function explain(
  signals: ReturnType<typeof buildSignals>,
  main: Category,
  minutes: number,
  heard: boolean,
): string {
  const head = heard ? `按 ${minutes} 分钟安排。` : `没有看清具体分钟，先按 ${minutes} 分钟。`;
  if (!signals.ready) {
    return `${head}记录还少，先沿本周主线，做完把正确数记下来。做完就停。`;
  }
  const bottle = bottleneck(signals);
  if (main === "part7" && signals.part7 !== null) {
    return `${head}Part 7 最近是 ${pct(signals.part7)}，是目前最需要动的一项。${minutes < 40 ? "时间不够做完整套，只做短的一篇。" : "大块时间放在阅读上。"}做完就停。`;
  }
  if (main === "part5" && signals.part5 !== null) {
    return `${head}Part 5 最近是 ${pct(signals.part5)}。今天先把句子题做稳，不改成一篇长阅读。`;
  }
  if (main === "part6" && signals.part6 !== null) {
    return `${head}Part 6 最近是 ${pct(signals.part6)}。只做短文填空，先读整段再填。`;
  }
  if (main === "vocabulary") {
    return `${head}认词还不稳。今天先补词，题量故意压短。`;
  }
  return `${head}优先处理${bottle.title}。${bottle.detail}`;
}
