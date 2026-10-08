"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/provider";
import { Button, Card } from "@/components/ui";
import { actionLabel, CATEGORY_LABEL, quantityText } from "@/lib/labels";
import { openTask } from "@/lib/open-task";
import type { SessionTask, TimeMode } from "@/lib/types";

const MODES: TimeMode[] = [15, 30, 60, 90];

export function Mission() {
  const router = useRouter();
  const { state, derived, setMode, startMinimum, restorePlan, completeTask, skipTask, uncompleteTask } = useStore();
  const session = state.sessions[derived.today];
  const [logging, setLogging] = useState<string | null>(null);
  const locked = session?.kind === "baseline" || session?.kind === "exam";
  const due = state.mistakes.filter((item) => !item.mastered && item.nextReview <= derived.today).length;

  return (
    <Card padded={false} data-testid="mission">
      <div className="border-b border-line px-5 py-5">
        <p className="text-sm font-semibold tracking-wide text-accent">今天的任务</p>
        <h2 className="mt-2 font-display text-3xl leading-tight">{derived.plan.focus}</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{derived.plan.why}</p>
        <p className="mt-4 text-sm font-semibold">
          合计 {derived.minutes} 分钟
          {session?.kind === "baseline" || session?.kind === "exam"
            ? ""
            : session?.source === "minimum"
              ? " · 最小任务"
              : session?.source === "coach"
                ? " · 按你刚才说的时间"
                : session
                  ? ` · ${session.mode === "minimum" ? "最小" : session.mode} 分钟版`
                  : ""}
        </p>
      </div>

      <ul className="divide-y divide-line">
        {derived.tasks.map((task) => (
          <li key={task.id} className={task.id === derived.next?.id ? "bg-accent-soft/40" : undefined} data-testid="task">
            <article className="px-5 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-muted">
                  {CATEGORY_LABEL[task.category]}
                  {task.id === derived.next?.id ? " · 现在做" : ""}
                </p>
                <p className="text-sm tabular-nums">{task.minutes} 分钟</p>
              </div>
              <h3 className="mt-1 text-xl font-semibold">{task.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{task.detail}</p>
              <p className="mt-2 text-sm">
                {quantityText(task.quantity, task.unit)}
                {task.target ? ` · ${task.target}` : ""}
                {task.completed && task.total ? ` · 记下 ${task.correct}/${task.total}` : ""}
                {task.skipped ? " · 已跳过" : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant={task.id === derived.next?.id ? "primary" : "ink"} onClick={() => openTask(task, (href) => router.push(href))}>
                  {actionLabel(task)}
                </Button>
                {task.completed ? (
                  <Button variant="ghost" onClick={() => uncompleteTask(task.id)}>
                    撤销
                  </Button>
                ) : (
                  <Button variant="soft" onClick={() => setLogging(logging === task.id ? null : task.id)}>
                    记下结果
                  </Button>
                )}
                {!task.completed && task.category === "review" && due === 0 ? (
                  <Button variant="ghost" onClick={() => skipTask(task.id)}>
                    没有错题，跳过
                  </Button>
                ) : null}
              </div>
              {logging === task.id && !task.completed ? (
                <LogForm
                  task={task}
                  onSave={(log) => {
                    completeTask(task.id, log);
                    setLogging(null);
                  }}
                  onDone={() => {
                    completeTask(task.id);
                    setLogging(null);
                  }}
                />
              ) : null}
            </article>
          </li>
        ))}
      </ul>

      <div className="border-t border-line px-5 py-5">
        {locked ? (
          <p className="text-sm text-muted">
            {session?.kind === "exam" ? "今天不要再换任务。" : "基线需要一整段时间，大约 75 分钟。平时的任务不是这样。"}
          </p>
        ) : (
          <>
            <p className="text-sm font-semibold">今天能学多久</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMode(mode)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${session?.mode === mode && session.source === "plan" ? "bg-ink text-paper" : "bg-paper text-ink"}`}
                >
                  {mode} 分钟
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">15 分钟会留下今天最重要的一项。下面这个按钮是另一套：只为了不断档。</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button data-testid="min-mode" variant="ink" onClick={startMinimum}>
                我只有 15 分钟
              </Button>
              {session?.source !== "plan" ? (
                <Button variant="ghost" onClick={restorePlan}>
                  恢复今天的主线
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>
      {derived.allDone ? <DayComplete /> : null}
    </Card>
  );
}

function LogForm({
  task,
  onSave,
  onDone,
}: {
  task: SessionTask;
  onSave: (log: { correct: number; total: number; minutes: number }) => void;
  onDone: () => void;
}) {
  const [correct, setCorrect] = useState("");
  const [total, setTotal] = useState(task.unit === "none" ? "" : String(task.quantity));
  const [minutes, setMinutes] = useState(String(task.minutes));
  const word = task.unit === "words";
  const needsScore = task.unit !== "none";

  function save() {
    const totalValue = Number(total);
    const correctValue = Number(correct);
    const minutesValue = Number(minutes);
    if (!Number.isFinite(totalValue) || totalValue <= 0) return;
    if (!Number.isFinite(correctValue) || correctValue < 0 || correctValue > totalValue) return;
    if (!Number.isFinite(minutesValue) || minutesValue <= 0) return;
    onSave({ correct: correctValue, total: totalValue, minutes: minutesValue });
  }

  return (
    <div className="mt-4 grid gap-3 rounded-xl bg-paper p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
      {needsScore ? (
        <>
          <label className="text-sm">
            {word ? "认识" : "正确"}
            <input value={correct} onChange={(event) => setCorrect(event.target.value)} inputMode="numeric" className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2" />
          </label>
          <label className="text-sm">
            总共
            <input value={total} onChange={(event) => setTotal(event.target.value)} inputMode="numeric" className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2" />
          </label>
        </>
      ) : null}
      <label className="text-sm">
        实际分钟
        <input value={minutes} onChange={(event) => setMinutes(event.target.value)} inputMode="numeric" className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2" />
      </label>
      <div className="flex items-end gap-2">
        {needsScore ? (
          <Button type="button" onClick={save}>
            保存
          </Button>
        ) : (
          <Button type="button" onClick={onDone}>
            完成
          </Button>
        )}
      </div>
    </div>
  );
}

function DayComplete() {
  const { derived } = useStore();
  const accuracy = derived.todayAccuracy;
  return (
    <div className="border-t border-line px-5 py-5">
      <h2 className="font-display text-3xl">今天完成</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">用时</dt>
          <dd className="text-lg font-semibold">{derived.todayMinutes} 分钟</dd>
        </div>
        <div>
          <dt className="text-muted">正确率</dt>
          <dd className="text-lg font-semibold">{accuracy ? `${accuracy.correct}/${accuracy.total}` : "今天没记下正确数"}</dd>
        </div>
        <div>
          <dt className="text-muted">新错题</dt>
          <dd className="text-lg font-semibold">{derived.todayMistakes}</dd>
        </div>
        <div>
          <dt className="text-muted">最弱</dt>
          <dd className="text-lg font-semibold">{derived.todayWeak}</dd>
        </div>
      </dl>
      <p className="mt-4 text-base">明天：{derived.tomorrow?.focus}</p>
    </div>
  );
}
