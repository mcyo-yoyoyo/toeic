"use client";

import { useState } from "react";
import { BaselinePanel } from "@/components/baseline";
import { useStore } from "@/components/provider";
import { Button, Card, Field, TextInput } from "@/components/ui";
import { isState } from "@/lib/storage";
import { todayISO } from "@/lib/dates";

export default function SettingsPage() {
  const { state, updateGoal, setName, resetAll, replaceState } = useStore();
  const [message, setMessage] = useState("");

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `toeic-300-os-${todayISO()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importData(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!isState(parsed)) {
          setMessage("这个文件不是本门户的备份。");
          return;
        }
        replaceState(parsed);
        setMessage("已恢复备份。");
      } catch {
        setMessage("文件读不出来。");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid max-w-2xl gap-6">
      <header>
        <h1 className="font-display text-4xl">设置</h1>
        <p className="mt-3 text-sm leading-6 text-muted">目标、考试日和备份。没有账号。清掉浏览器数据之前，先导出。</p>
      </header>
      <Card>
        <div className="grid gap-4">
          <Field label="怎么称呼" hint="可空">
            <TextInput value={state.name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Reading 目标">
            <TextInput
              inputMode="numeric"
              value={String(state.goal.targetScore)}
              onChange={(event) => updateGoal({ targetScore: Number(event.target.value) || 300 })}
            />
          </Field>
          <Field label="目标日期">
            <TextInput type="date" value={state.goal.targetDate} onChange={(event) => updateGoal({ targetDate: event.target.value })} />
          </Field>
        </div>
      </Card>
      <BaselinePanel />
      <Card>
        <h2 className="text-lg font-semibold">备份</h2>
        <p className="mt-2 text-sm leading-6 text-muted">进度存在 localStorage。换浏览器或清站点数据会丢掉，除非你导出这份文件。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={exportData}>导出</Button>
          <label className="inline-flex cursor-pointer items-center rounded-full border border-line px-4 py-2.5 text-sm font-semibold">
            导入
            <input
              className="sr-only"
              type="file"
              accept="application/json"
              onChange={(event) => importData(event.target.files?.[0])}
            />
          </label>
        </div>
        {message ? <p className="mt-3 text-sm">{message}</p> : null}
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">清空这台浏览器里的记录</h2>
        <p className="mt-2 text-sm leading-6 text-muted">任务、错题、基线都会去掉。56 天路线还在，因为它是算出来的。</p>
        <Button
          className="mt-4"
          variant="ghost"
          onClick={() => {
            if (window.confirm("这会清掉这台浏览器里的计划和记录。导出备份了吗？")) resetAll();
          }}
        >
          清空
        </Button>
      </Card>
    </div>
  );
}
