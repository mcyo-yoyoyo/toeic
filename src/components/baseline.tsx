"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/provider";
import { Button, Card, Field, TextInput } from "@/components/ui";
import { estimateFromRaw } from "@/lib/estimate";
import { resourceById } from "@/lib/resources";

export function BaselinePanel({ compact = false, startOpen = false }: { compact?: boolean; startOpen?: boolean }) {
  const { state, saveBaseline, skipBaseline } = useStore();
  const [open, setOpen] = useState(startOpen || state.baseline === null);
  const [part5, setPart5] = useState(state.baseline ? String(state.baseline.part5Correct) : "");
  const [part6, setPart6] = useState(state.baseline ? String(state.baseline.part6Correct) : "");
  const [part7, setPart7] = useState(state.baseline ? String(state.baseline.part7Correct) : "");
  const [total, setTotal] = useState(state.baseline ? String(state.baseline.totalMinutes) : "");
  const [remain, setRemain] = useState(state.baseline ? String(state.baseline.remainingMinutes) : "");
  const [error, setError] = useState("");

  const p5 = Number(part5);
  const p6 = Number(part6);
  const p7 = Number(part7);
  const ready = part5 !== "" && part6 !== "" && part7 !== "" && [p5, p6, p7].every((n) => Number.isFinite(n));
  const sum = ready ? p5 + p6 + p7 : null;
  const estimate = sum !== null && sum <= 100 ? estimateFromRaw(sum) : null;
  const sample = resourceById("ets-prepare");

  if (state.baseline && !open) {
    if (compact) return null;
    return (
      <Card>
        <p className="text-sm text-muted">基线练习估算</p>
        <p className="mt-1 font-display text-4xl tabular-nums">{state.baseline.estimate}</p>
        <p className="mt-2 text-sm text-muted">
          {state.baseline.source === "short"
            ? `短诊断 · Part 5 ${state.baseline.part5Correct}/${state.baseline.part5Total ?? 10} · Part 6 ${state.baseline.part6Correct}/${state.baseline.part6Total ?? 4} · Part 7 ${state.baseline.part7Correct}/${state.baseline.part7Total ?? 3}`
            : `Reading ${state.baseline.readingCorrect}/100 · Part 5 ${state.baseline.part5Correct}/30 · Part 6 ${state.baseline.part6Correct}/16 · Part 7 ${state.baseline.part7Correct}/54`}
        </p>
        <Button className="mt-4" variant="ghost" onClick={() => setOpen(true)}>
          修改基线
        </Button>
      </Card>
    );
  }

  function submit() {
    if (!ready || sum === null || estimate === null) {
      setError("三个 Part 的正确数都要填。");
      return;
    }
    if (p5 < 0 || p5 > 30 || p6 < 0 || p6 > 16 || p7 < 0 || p7 > 54) {
      setError("Part 5 最多 30，Part 6 最多 16，Part 7 最多 54。");
      return;
    }
    const minutes = Number(total);
    const left = Number(remain);
    if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 150 || !Number.isFinite(left) || left < 0 || left > 75) {
      setError("用时填实际分钟。剩余可以是 0。");
      return;
    }
    saveBaseline({
      part5Correct: p5,
      part6Correct: p6,
      part7Correct: p7,
      totalMinutes: minutes,
      remainingMinutes: left,
    });
    setError("");
    setOpen(false);
  }

  return (
    <Card id="baseline" data-testid="baseline-form">
      <p className="text-sm font-semibold text-accent">{compact ? "基线还没做" : "第一步"}</p>
      <h2 className="mt-2 font-display text-3xl leading-tight">{compact ? "补一次 Reading" : "做一套 Reading，然后把数填在这里"}</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        有完整阅读卷就做阅读，75 分钟，Part 5 最多 30、Part 6 最多 16、Part 7 最多 54。没有完整卷就先做门户里的开课诊断，那是短诊断，不能当成 100 题。算出来的是练习估算，不是官方分数。
      </p>
      {sample ? (
        <a className="mt-4 inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-white" href={sample.url} target="_blank" rel="noreferrer">
          打开官方样题
        </a>
      ) : null}
      <Link className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent" href="/practice/diagnostic">
        没有完整卷，做开课诊断
      </Link>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="Part 5 正确" hint="共 30">
          <TextInput inputMode="numeric" value={part5} onChange={(event) => setPart5(event.target.value)} />
        </Field>
        <Field label="Part 6 正确" hint="共 16">
          <TextInput inputMode="numeric" value={part6} onChange={(event) => setPart6(event.target.value)} />
        </Field>
        <Field label="Part 7 正确" hint="共 54">
          <TextInput inputMode="numeric" value={part7} onChange={(event) => setPart7(event.target.value)} />
        </Field>
        <Field label="用时" hint="分钟">
          <TextInput inputMode="numeric" value={total} onChange={(event) => setTotal(event.target.value)} />
        </Field>
        <Field label="剩余" hint="分钟，没有就填 0">
          <TextInput inputMode="numeric" value={remain} onChange={(event) => setRemain(event.target.value)} />
        </Field>
      </div>
      <p className="mt-4 text-sm">
        Reading 正确 {sum ?? "—"} / 100
        {estimate !== null ? ` · 练习估算 ${estimate}` : ""}
      </p>
      <p className="mt-1 text-sm text-muted">300 分大约在 64/100 附近。这只用来看你自己有没有靠近。</p>
      {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={submit}>保存基线</Button>
        {!compact && state.baseline === null ? (
          <Button variant="ghost" onClick={skipBaseline}>
            先跳过，按通用路线开始
          </Button>
        ) : null}
        {state.baseline ? (
          <Button variant="ghost" onClick={() => setOpen(false)}>
            取消
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
