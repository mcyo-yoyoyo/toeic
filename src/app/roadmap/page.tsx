"use client";

import Link from "next/link";
import { useStore } from "@/components/provider";
import { Card } from "@/components/ui";
import { formatCN, formatShort } from "@/lib/dates";
import { buildPlan, WEEK_META } from "@/lib/plan";

export default function RoadmapPage() {
  const { state, derived } = useStore();
  const days = Array.from({ length: 56 }, (_, index) => buildPlan(index + 1, state.examChoice));
  const buffer = Array.from({ length: 25 }, (_, index) => buildPlan(57 + index, state.examChoice));

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm text-muted">56 天主计划 · 10/12–12/6 · 大陆听读 12/20</p>
        <h1 className="mt-2 font-display text-4xl">这周做什么，已经定了</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          现在是{derived.plan.phase}。缺的天数不会堆到今天。
          <Link href="/" className="ml-2 font-semibold text-accent">
            回到今天
          </Link>
        </p>
      </header>
      <div className="grid gap-3">
        {WEEK_META.map((week) => {
          const weekDays = week.week === 0 ? [] : week.week === 9 ? buffer : days.filter((day) => day.week === week.week);
          const current = derived.plan.week === week.week;
          return (
            <details key={week.week} open={current} className="rounded-2xl border border-line bg-card">
              <summary className="cursor-pointer list-none px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    {week.week === 0 ? "开课前" : week.week === 9 ? "缓冲" : `第 ${week.week} 周`} · {week.title}
                  </h2>
                  <span className="text-sm text-muted">{week.dates}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{week.aim}</p>
              </summary>
              {weekDays.length > 0 ? (
                <ul className="divide-y divide-line border-t border-line">
                  {weekDays.map((day) => {
                    const status = statusFor(day.date, derived.today, state.sessions, state.completions);
                    return (
                      <li key={day.date} className={`grid gap-1 px-5 py-3 sm:grid-cols-[92px_1fr_auto] ${day.date === derived.today ? "bg-accent-soft/50" : ""}`}>
                        <span className="text-sm text-muted">{formatShort(day.date)} 周{formatCN(day.date).slice(-1)}</span>
                        <span>
                          <span className="font-semibold">{day.focus}</span>
                          <span className="mt-0.5 block text-sm text-muted">{day.tasks.reduce((sum, task) => sum + task.minutes, 0)} 分钟 · {day.tasks.map((task) => task.title).slice(0, 2).join("，")}</span>
                        </span>
                        <span className="text-sm text-muted">{status}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="border-t border-line px-5 py-4 text-sm leading-6 text-muted">{week.detail}</p>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
}

function statusFor(
  date: string,
  today: string,
  sessions: { [key: string]: { tasks: { id: string }[] } },
  completions: { [key: string]: { completed?: boolean } },
): string {
  if (date === today) return "今天";
  if (date > today) return "未到";
  const session = sessions[date];
  if (!session) return "未做";
  const done = session.tasks.every((task) => completions[`${date}:${task.id}`]?.completed);
  return done ? "完成" : "未做";
}
