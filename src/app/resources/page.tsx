"use client";

import Link from "next/link";
import { useStore } from "@/components/provider";
import { Button, Card } from "@/components/ui";
import { formatCN } from "@/lib/dates";
import { hubResources, radar, type Resource, type ResourceGroup } from "@/lib/resources";

const GROUPS: { id: ResourceGroup; title: string }[] = [
  { id: "offline", title: "门户里直接做" },
  { id: "official", title: "官方" },
  { id: "admin", title: "报名" },
];

export default function ResourcesPage() {
  const { state, derived, refreshResources } = useStore();
  const view = radar();
  const resources = hubResources();
  const todayIds = new Set(derived.tasks.map((task) => task.resourceId));
  const todayResources = resources.filter((item) => todayIds.has(item.id));

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm text-muted">大陆公开考试的报名在官网。每天的题在门户里做。</p>
        <h1 className="mt-2 font-display text-4xl leading-tight">今天会打开这些</h1>
      </header>

      <Card>
        <p className="text-sm font-semibold text-accent">今天的任务要用</p>
        <ul className="mt-3 grid gap-3">
          {todayResources.map((item) => (
            <li key={item.id}>
              <ResourceAnchor item={item} className="font-semibold underline decoration-line underline-offset-4" />
              <p className="mt-1 text-sm text-muted">{item.why}</p>
            </li>
          ))}
          {todayResources.length === 0 ? <li className="text-sm text-muted">今天的任务在门户内部完成。</li> : null}
        </ul>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent">资料雷达</p>
            <h2 className="mt-1 text-2xl font-semibold">大陆官方日程</h2>
          </div>
          <Button variant="ink" onClick={refreshResources}>
            核对资料
          </Button>
        </div>
        {view.latest ? (
          <div className="mt-4">
            <ResourceAnchor item={view.latest} className="text-lg font-semibold underline decoration-line underline-offset-4" />
            <p className="mt-2 text-sm leading-6">{view.latest.why}</p>
          </div>
        ) : null}
        <p className="mt-4 text-sm text-muted">上次核对：{state.resourceCheckedAt ? formatCN(state.resourceCheckedAt) : "内置于 2026-10-08，还没手动核对"}</p>
        {state.resourceNote ? <p className="mt-2 text-sm leading-6">{state.resourceNote}</p> : null}
        <h3 className="mt-5 text-sm font-semibold">建议用</h3>
        <ul className="mt-2 grid gap-2 text-sm">
          {view.recommended.map((item) => (
            <li key={item.id}>
              <ResourceAnchor item={item} className="font-semibold" />
              <span className="text-muted"> · {item.provider}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-5 text-sm font-semibold">可以用，但不是主线</h3>
        <ul className="mt-2 grid gap-2 text-sm">
          {view.optional.map((item) => (
            <li key={item.id}>
              <ResourceAnchor item={item} className="font-semibold" />
              <span className="text-muted"> · {item.why}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-6 text-muted">不会自动加入新网站。官方试题不放进这个仓库，避免公开到 GitHub 时带上受版权保护的题目。</p>
      </Card>

      {GROUPS.map((group) => {
        const items = resources.filter((item) => item.group === group.id);
        if (items.length === 0) return null;
        return (
          <section key={group.id} className="grid gap-3">
            <h2 className="text-lg font-semibold">{group.title}</h2>
            {items.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <span className="text-xs font-semibold text-muted">{item.internal ? "本地" : item.priority === "primary" ? "主要" : "备用"}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {item.provider} · {item.type}
                </p>
                <p className="mt-3 text-sm leading-6">{item.why}</p>
                <ResourceAnchor
                  item={item}
                  className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper"
                  label={item.internal ? "在这里做" : "打开官网"}
                />
              </Card>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function ResourceAnchor({ item, className, label }: { item: Resource; className: string; label?: string }) {
  if (item.internal) {
    return (
      <Link href={item.url} className={className}>
        {label ?? item.title}
      </Link>
    );
  }
  return (
    <a className={className} href={item.url} target="_blank" rel="noreferrer">
      {label ?? item.title}
    </a>
  );
}
