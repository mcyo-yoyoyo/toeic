import { buildSignals } from "./adaptive";
import { planForDate } from "./plan";
import type { AppState, DayKind, DayPlan, DaySession, PlannedTask, TimeMode } from "./types";
import { todayISO } from "./dates";

export function applyAdaptive(plan: DayPlan, state: AppState, today: string): DayPlan {
  if (plan.kind === "baseline" || plan.kind === "exam" || plan.kind === "eve" || plan.day < 1) return plan;
  const signals = buildSignals(state, today);
  if (!signals.ready) return plan;
  const tasks = plan.tasks.map((task) => ({ ...task }));
  const notes: string[] = [];
  let focus = plan.focus;

  const boostPart7 =
    signals.part5 !== null &&
    signals.part5 >= 0.85 &&
    signals.part7 !== null &&
    signals.part7 < 0.65 &&
    plan.week >= 2 &&
    plan.week <= 7;

  if (boostPart7) {
    const part5 = tasks.find((task) => task.category === "part5");
    if (part5) {
      part5.quantity = Math.max(5, Math.round(part5.quantity * 0.6));
      part5.minutes = Math.max(8, Math.round(part5.minutes * 0.7));
      part5.importance = 2;
    }
    const part7 = tasks.find((task) => task.category === "part7");
    if (part7) {
      part7.importance = 1;
      part7.minutes += 5;
      part7.detail = "Part 5 已经到 85% 以上，Part 7 还低于 65%。今天以这篇为主。";
    } else {
      tasks.unshift({
        id: `d${plan.day}-part7-boost`,
        category: "part7",
        title: "Part 7 单篇 · 补弱",
        detail: "Part 5 已经够用。多出来的时间拿来读一篇，不再加句子题。",
        minutes: 15,
        quantity: 1,
        unit: "passages",
        target: "记下用时",
        resourceId: "offline-part7",
        importance: 1,
      });
    }
    focus = "今天把时间让给 Part 7";
    notes.push("Part 5 已到 85% 以上，Part 7 仍低于 65%，所以今天减少句子题。");
  }

  if (signals.vocab !== null && signals.vocab < 0.7) {
    const vocab = tasks.find((task) => task.category === "vocabulary");
    if (vocab) {
      vocab.quantity += 8;
      vocab.minutes += 5;
      vocab.importance = 1;
      vocab.detail = "最近认词比例低于 70%。今天先把词补上，再做题。";
    }
    notes.push("词汇练习低于 70%，今天多留了一组词。");
  }

  const slowPart5 =
    !boostPart7 &&
    signals.part5 !== null &&
    signals.part5 >= 0.85 &&
    signals.part5Sec !== null &&
    signals.part5Sec > 40;
  if (slowPart5) {
    const part5 = tasks.find((task) => task.category === "part5");
    if (part5) {
      part5.title = "Part 5 限时";
      part5.target = "每题不超过 30 秒";
      part5.detail = "正确率已经够。今天用计时，不增加题量。";
    }
    focus = "Part 5 只练速度";
    notes.push("Part 5 正确率够了，但单题偏慢，今天改成限时。");
  }

  if (signals.grammarHeavy) {
    notes.push("错题里语法最多，语法和 Part 5 先留着。");
  }
  if (signals.preferShort) {
    notes.push("你经常只有短时间。做完较短的一版就算今天完成。");
  }

  return {
    ...plan,
    focus,
    why: notes.length > 0 ? notes.join("") : plan.why,
    tasks: cap(tasks, 5),
  };
}

export function scaleTasks(tasks: PlannedTask[], mode: TimeMode, kind: DayKind, day: number): PlannedTask[] {
  if (kind === "exam" || kind === "baseline") return tasks.map((task) => ({ ...task }));
  if (mode === 60) return tasks.map((task) => ({ ...task }));
  if (mode === 90) {
    const copy = tasks.map((task) => ({ ...task }));
    const core = copy.find((task) => task.importance === 1) ?? copy[0];
    if (!core) return copy;
    copy.push({
      ...core,
      id: `d${day}-stretch`,
      title: `${core.title} · 加练`,
      detail: "前面做完还有余力再做。累了就停，不加新题型。",
      minutes: 20,
      quantity: Math.max(1, Math.round(core.quantity * 0.5)),
      importance: 3,
      target: "可停",
    });
    return copy;
  }
  if (mode === 30) {
    const kept = tasks.filter((task) => task.importance <= 2);
    return fit(kept.length > 0 ? kept.slice(0, 3) : tasks.slice(0, 2), 30);
  }
  const core = tasks.filter((task) => task.importance === 1);
  const picked = (core.length > 0 ? core : tasks.slice(0, 1)).slice(0, 2);
  return fit(picked, 15);
}

export function minimumTasks(day: number): PlannedTask[] {
  return [
    {
      id: `d${day}-min-vocab`,
      category: "vocabulary",
      title: "10 个词",
      detail: "只求不断档。认识的快速过，不认识的留下来。",
      minutes: 5,
      quantity: 10,
      unit: "words",
      resourceId: "offline-vocab",
      importance: 1,
    },
    {
      id: `d${day}-min-part5`,
      category: "part5",
      title: "Part 5 · 5 题",
      detail: "不做整套。做完标错因。",
      minutes: 5,
      quantity: 5,
      unit: "questions",
      target: "做完即可",
      resourceId: "offline-part5",
      importance: 1,
    },
    {
      id: `d${day}-min-review`,
      category: "review",
      title: "复习 3 条错题",
      detail: "没有错题就跳过。连续天数仍然算保住。",
      minutes: 5,
      quantity: 3,
      unit: "mistakes",
      resourceId: "internal-mistakes",
      href: "/mistakes",
      importance: 1,
    },
  ];
}

export function createPlannedSession(state: AppState, today: string, mode: TimeMode): DaySession {
  const raw = planForDate(today, {
    baselineDone: state.baseline !== null,
    baselineSkipped: state.baselineSkipped,
    examChoice: state.examChoice,
  });
  const plan = applyAdaptive(raw, state, today);
  return toSession(plan, scaleTasks(plan.tasks, mode, plan.kind, plan.day), "plan", mode);
}

export function createMinimumSession(state: AppState, today: string): DaySession {
  const raw = planForDate(today, {
    baselineDone: state.baseline !== null,
    baselineSkipped: state.baselineSkipped,
    examChoice: state.examChoice,
  });
  return {
    ...toSession(raw, minimumTasks(raw.day), "minimum", "minimum"),
    focus: "今天只保连续",
    why: `这是大约 15 分钟的最小任务。今天的主线本来是「${raw.focus}」。有余力再恢复主线。`,
    light: true,
    kind: "light",
  };
}

export function toSession(
  plan: DayPlan,
  tasks: PlannedTask[],
  source: DaySession["source"],
  mode: DaySession["mode"],
): DaySession {
  return {
    date: plan.date,
    source,
    mode,
    tasks,
    focus: plan.focus,
    why: plan.why,
    day: plan.day,
    week: plan.week,
    light: plan.light,
    phase: plan.phase,
    kind: plan.kind,
  };
}

export function prepareState(state: AppState, today = todayISO()): AppState {
  if (state.sessions[today]) return state;
  const signals = buildSignals(state, today);
  const mode = !state.modeTouched && signals.preferShort ? 30 : state.preferredMode;
  const session = createPlannedSession(state, today, mode);
  return {
    ...state,
    preferredMode: mode,
    sessions: { ...state.sessions, [today]: session },
  };
}

function fit(tasks: PlannedTask[], budget: number): PlannedTask[] {
  if (tasks.length === 0) return [];
  const total = tasks.reduce((sum, task) => sum + task.minutes, 0);
  if (total <= budget) return tasks.map((task) => ({ ...task }));
  const raw = tasks.map((task) => Math.max(4, Math.round((task.minutes / total) * budget)));
  const drift = raw.reduce((sum, minutes) => sum + minutes, 0) - budget;
  raw[raw.length - 1] = Math.max(4, raw[raw.length - 1] - drift);
  return tasks.map((task, index) => {
    const minutes = raw[index] ?? task.minutes;
    const ratio = minutes / task.minutes;
    const quantity = task.unit === "none" ? task.quantity : Math.max(1, Math.round(task.quantity * ratio));
    return { ...task, minutes, quantity };
  });
}

function cap(tasks: PlannedTask[], max: number): PlannedTask[] {
  if (tasks.length <= max) return tasks;
  const ranked = [...tasks].sort((a, b) => a.importance - b.importance || tasks.indexOf(a) - tasks.indexOf(b));
  const keep = new Set(ranked.slice(0, max).map((task) => task.id));
  return tasks.filter((task) => keep.has(task.id));
}
