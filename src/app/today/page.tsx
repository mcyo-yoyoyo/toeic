"use client";

import { BaselinePanel } from "@/components/baseline";
import { CoachPanel } from "@/components/coach";
import { Mission } from "@/components/mission";
import { useStore } from "@/components/provider";

export default function TodayPage() {
  const { state, derived } = useStore();
  const showBaseline = derived.plan.kind === "baseline" && state.baseline === null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6">
        <header>
          <p className="text-sm text-muted">{derived.todayLabel}</p>
          <h1 className="mt-2 font-display text-4xl">今天只做这些</h1>
        </header>
        {showBaseline ? <BaselinePanel /> : null}
        {derived.needsBaselineBanner ? <BaselinePanel compact /> : null}
        {showBaseline ? null : <Mission />}
      </div>
      <CoachPanel />
    </div>
  );
}
