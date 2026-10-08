"use client";

import { BaselinePanel } from "@/components/baseline";
import { CoachPanel } from "@/components/coach";
import { Mission } from "@/components/mission";
import { useStore } from "@/components/provider";
import { Bar, Button, Card } from "@/components/ui";
import { coreDayLabel } from "@/lib/derive";
import { pct } from "@/lib/labels";
import { resourceById } from "@/lib/resources";
import type { ExamChoice } from "@/lib/types";
import type { WeekReview } from "@/lib/derive";

export default function HomePage() {
  const { state, derived } = useStore();
  const showBaseline = derived.plan.kind === "baseline" && state.baseline === null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="grid gap-6">
        <Hero />
        {showBaseline ? <BaselinePanel /> : null}
        {derived.needsBaselineBanner ? <BaselinePanel compact /> : null}
        {showBaseline ? null : <Mission />}
        {derived.deadline ? <Deadline /> : null}
        {derived.weekReview ? <WeekCard review={derived.weekReview} /> : null}
      </div>
      <aside className="grid gap-6">
        <ScoreCard />
        <CoachPanel />
      </aside>
    </div>
  );
}

function Hero() {
  const { state, derived } = useStore();
  const started = derived.dayNumber >= 1 && derived.dayNumber <= 56;
  return (
    <header>
      <p className="text-sm text-muted">
        {state.name ? `${state.name} · ` : ""}
        {derived.todayLabel} · {derived.plan.phase}
      </p>
      <h1 className="mt-2 max-w-3xl break-words font-display text-4xl leading-tight md:text-5xl">{derived.plan.focus}</h1>
      <div className="mt-6 flex items-end justify-between gap-4 text-sm">
        <span>{coreDayLabel(derived.dayNumber, derived.today)}</span>
        <span className="tabular-nums">{started ? `${derived.programPercent}%` : "10/12 开始"}</span>
      </div>
      <div className="mt-2">
        <Bar value={started ? derived.programPercent : 0} />
      </div>
      <p className="mt-3 text-sm text-muted">
        Reading 目标 {state.goal.targetScore} · {state.goal.targetDate}
        {derived.examCountdown >= 0 ? ` · 还有 ${derived.examCountdown} 天` : ""}
      </p>
    </header>
  );
}

function ScoreCard() {
  const { derived } = useStore();
  const rows = [
    ["Part 5", pct(derived.parts.part5)],
    ["Part 6", pct(derived.parts.part6)],
    ["Part 7", pct(derived.parts.part7)],
    ["词汇", pct(derived.parts.vocab)],
  ] as const;
  return (
    <Card>
      <p className="text-sm text-muted">练习估算</p>
      <p className="mt-1 font-display text-5xl tabular-nums">{derived.estimate ?? "—"}</p>
      <p className="mt-2 text-sm leading-6 text-muted">不是官方分数。完整阅读里 300 大约在 64/100 附近。短诊断按正确率折算，重复题不改这个判断。</p>
      <p className="mt-4 text-sm">连续 {derived.streak} 天</p>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm leading-6 text-muted">
        当前判断：{derived.bottle.title}。{derived.bottle.detail}
      </p>
    </Card>
  );
}

function Deadline() {
  const { derived, setExamChoice, confirmRegistration } = useStore();
  const schedule = resourceById("cn-schedule");
  if (!derived.deadline) return null;
  const choices: { id: ExamChoice; label: string }[] = [
    { id: "dec20", label: "我报 12/20" },
    { id: "both", label: "11/22 和 12/20" },
    { id: "nov22", label: "我报 11/22" },
    { id: "later", label: "先不报" },
  ];
  return (
    <Card className="bg-warn-soft">
      <h2 className="text-lg font-semibold">{derived.deadline.title}</h2>
      <p className="mt-2 text-sm leading-6">{derived.deadline.detail}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {schedule ? (
          <a className="inline-flex rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper" href={schedule.url} target="_blank" rel="noreferrer">
            打开官方日程
          </a>
        ) : null}
        {choices.map((choice) => (
          <Button key={choice.id} variant="ghost" onClick={() => setExamChoice(choice.id)}>
            {choice.label}
          </Button>
        ))}
        <Button variant="soft" onClick={confirmRegistration}>
          我已报名
        </Button>
      </div>
    </Card>
  );
}

function WeekCard({ review }: { review: WeekReview }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-accent">第 {review.week} 周回顾</p>
      <h2 className="mt-2 text-2xl font-semibold">{review.title}</h2>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>学习：{review.consistency}</div>
        <div>词汇：{review.vocab}</div>
        <div>语法：{review.grammar}</div>
        <div>Part 5：{review.part5}</div>
        <div>Part 6：{review.part6}</div>
        <div>Part 7：{review.part7}</div>
        <div className="sm:col-span-2">速度：{review.speed}</div>
      </dl>
      <p className="mt-4 text-sm font-semibold">最大的卡住点：{review.bottle.title}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{review.bottle.detail}</p>
      <p className="mt-3 text-sm">下一周：{review.bottle.next}</p>
    </Card>
  );
}
