"use client";

import { useState } from "react";
import { useStore } from "@/components/provider";
import { Button, Card, Area } from "@/components/ui";
import { quantityText } from "@/lib/labels";
import type { CoachPlan } from "@/lib/coach";

export function CoachPanel() {
  const { applyCoach } = useStore();
  const [text, setText] = useState("我只有 25 分钟");
  const [result, setResult] = useState<CoachPlan | null>(null);

  return (
    <Card>
      <p className="text-sm font-semibold text-accent">时间对不上</p>
      <h2 className="mt-2 text-xl font-semibold">跟助理说你有多少分钟</h2>
      <p className="mt-2 text-sm leading-6 text-muted">它会按你目前最弱的一项排顺序，不会只加题量。做完就停。</p>
      <Area className="mt-4 min-h-24" value={text} onChange={(event) => setText(event.target.value)} />
      <Button
        className="mt-3"
        variant="ink"
        onClick={() => {
          const plan = applyCoach(text);
          setResult(plan);
        }}
      >
        按这个时间安排
      </Button>
      {result ? (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-sm font-semibold">优先：{result.priority}</p>
          <p className="mt-2 text-sm leading-6">{result.why}</p>
          <ol className="mt-3 grid gap-2 text-sm">
            {result.tasks.map((task, index) => (
              <li key={task.id}>
                {index + 1}. {task.title} · {quantityText(task.quantity, task.unit)} · {task.minutes} 分钟
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted">已经换成今天的任务。</p>
        </div>
      ) : null}
    </Card>
  );
}
