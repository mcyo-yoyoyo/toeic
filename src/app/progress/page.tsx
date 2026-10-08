"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useStore } from "@/components/provider";
import { Bar, Card } from "@/components/ui";
import { dateForDay } from "@/lib/dates";
import { pct } from "@/lib/labels";

const Charts = dynamic(() => import("@/components/charts"), { ssr: false });

export default function ProgressPage() {
  const { state, derived } = useStore();
  const points = [
    ...(state.baseline ? [{ label: "基线", estimate: state.baseline.estimate }] : []),
    ...derived.reviews.filter((review) => review.estimate !== null).map((review) => ({ label: `第${review.week}周`, estimate: review.estimate as number })),
  ];
  const minutes = derived.reviews.map((review) => ({
    label: `第${review.week}周`,
    minutes: minutesBetween(state.completions, dateForDay((review.week - 1) * 7 + 1), dateForDay(review.week * 7)),
  }));
  const parts = [
    ["Part 5", derived.parts.part5],
    ["Part 6", derived.parts.part6],
    ["Part 7", derived.parts.part7],
    ["词汇", derived.parts.vocab],
    ["语法", derived.parts.grammar],
  ] as const;

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm text-muted">只看有没有靠近 300</p>
        <h1 className="mt-2 font-display text-4xl">练习估算 {derived.estimate ?? "还没有"}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          {derived.bottle.title}。{derived.bottle.detail} 下一周：{derived.bottle.next}。
          <Link href="/" className="ml-2 font-semibold text-accent">
            回到今天
          </Link>
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">学习分钟</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{derived.studiedMinutes}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">完成的任务</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{derived.completedTasks}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">连续天数</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{derived.streak}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">练习估算</h2>
        <p className="mt-1 text-sm text-muted">虚线是 300。这不是官方换算。</p>
        <div className="mt-4">
          <Charts kind="estimate" points={points} minutes={minutes} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">各部分</h2>
        <div className="mt-4 grid gap-4">
          {parts.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{label}</span>
                <span className="tabular-nums">{pct(value)}</span>
              </div>
              <Bar value={value === null ? 0 : value * 100} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">每周分钟</h2>
        <div className="mt-4">
          <Charts kind="minutes" points={points} minutes={minutes} />
        </div>
      </Card>

      <div className="grid gap-3">
        {derived.reviews.map((review) => (
          <Card key={review.week}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">
                第 {review.week} 周 · {review.title}
              </h2>
              <span className="text-sm text-muted">{review.dates}</span>
            </div>
            <p className="mt-2 text-sm">练习估算 {review.estimate ?? "—"} · {review.consistency}</p>
            <p className="mt-1 text-sm text-muted">
              词汇 {review.vocab} · 语法 {review.grammar} · Part 5 {review.part5} · Part 6 {review.part6} · Part 7 {review.part7}
            </p>
            <p className="mt-2 text-sm">卡住点：{review.bottle.title}。下一周：{review.bottle.next}</p>
          </Card>
        ))}
        {derived.reviews.length === 0 ? <p className="text-sm text-muted">主计划从 10 月 12 日开始后，这里按周汇总。</p> : null}
      </div>
    </div>
  );
}

function minutesBetween(completions: Record<string, { minutesSpent?: number; skipped?: boolean }>, start: string, end: string): number {
  let total = 0;
  for (const [key, value] of Object.entries(completions)) {
    const date = key.slice(0, 10);
    if (date >= start && date <= end && !value.skipped) total += value.minutesSpent ?? 0;
  }
  return total;
}
