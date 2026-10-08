"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChoiceRun, DiagnosticRun, PassageRun, PracticeHome, VocabRun } from "@/components/practice";
import { dayDeck, isPracticeSet } from "@/lib/bank";
import { useStore } from "@/components/provider";

export function PracticeSetPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">正在打开练习</p>}>
      <SetBody />
    </Suspense>
  );
}

function SetBody() {
  const params = useParams<{ set: string }>();
  const salt = Number(useSearchParams().get("salt") ?? "0");
  const set = params.set;
  const { derived } = useStore();
  if (!isPracticeSet(set)) return <PracticeHome />;
  const today = dayDeck(derived.dayNumber);
  if (set === "vocab") return <VocabRun />;
  if (set === "part5") {
    return <ChoiceRun title={salt ? "语法" : "Part 5"} items={salt ? today.grammar : today.part5} category={salt ? "grammar" : "part5"} part="5" />;
  }
  if (set === "part6") return <PassageRun set={today.part6} category="part6" />;
  if (set === "part7-multi") return <PassageRun set={today.multi} category="part7" />;
  if (set === "diagnostic") return <DiagnosticRun />;
  return <PassageRun set={today.part7} category="part7" />;
}
