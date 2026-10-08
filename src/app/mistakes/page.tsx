"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/provider";
import { Button, Card, Field, Select, TextInput, Area } from "@/components/ui";
import { formatCN } from "@/lib/dates";
import { dueMistakes } from "@/lib/derive";
import { REASON_LABEL, REASONS, TAGS } from "@/lib/labels";
import type { Part, Reason } from "@/lib/types";

export default function MistakesPage() {
  const { state, derived, addMistake, reviewMistake, masterMistake, deleteMistake } = useStore();
  const due = dueMistakes(state.mistakes, derived.today);
  const fresh = state.mistakes.filter((item) => !item.mastered && item.reviewCount === 0);
  const reviewing = state.mistakes.filter((item) => !item.mastered && item.reviewCount > 0);
  const mastered = state.mistakes.filter((item) => item.mastered);
  const [part, setPart] = useState<Part>("5");
  const [reason, setReason] = useState<Reason>("grammar");
  const [tag, setTag] = useState("词形");
  const [questionId, setQuestionId] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm text-muted">错题是这个门户自己的部分</p>
        <h1 className="mt-2 font-display text-4xl">先复习到期的 {due.length} 条</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          做完外部题目，把错因记在这里。复习间隔是 1、3、7、14、30 天。
          {derived.allDone ? "" : " 如果今天的任务还没做完，先回到今天。"}
          <Link href="/" className="ml-2 font-semibold text-accent">
            回到今天
          </Link>
        </p>
      </header>

      <Card>
        <h2 className="text-lg font-semibold">现在可复习</h2>
        {due.length === 0 ? <p className="mt-3 text-sm text-muted">今天没有到期错题。</p> : null}
        <ul className="mt-3 grid gap-3">
          {due.map((item) => (
            <li key={item.id} className="rounded-xl bg-paper p-3">
              <MistakeRow itemDate={formatCN(item.date)} part={item.part} reason={REASON_LABEL[item.reason]} tag={item.category} count={item.reviewCount} notes={item.notes} questionId={item.questionId} />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => reviewMistake(item.id)}>复习了一次</Button>
                <Button variant="ghost" onClick={() => masterMistake(item.id, true)}>
                  已掌握
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">记一条</h2>
        <form
          className="mt-4 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!tag.trim()) return;
            addMistake({ part, reason, category: tag.trim(), questionId: questionId.trim(), notes: notes.trim() });
            setQuestionId("");
            setNotes("");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Part">
              <Select value={part} onChange={(event) => setPart(event.target.value as Part)}>
                <option value="5">Part 5</option>
                <option value="6">Part 6</option>
                <option value="7">Part 7</option>
              </Select>
            </Field>
            <Field label="原因">
              <Select value={reason} onChange={(event) => setReason(event.target.value as Reason)}>
                {REASONS.map((item) => (
                  <option key={item} value={item}>
                    {REASON_LABEL[item]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="标签" hint="例如词形">
            <TextInput value={tag} onChange={(event) => setTag(event.target.value)} list="tags" />
            <datalist id="tags">
              {TAGS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </Field>
          <Field label="题号" hint="可空">
            <TextInput value={questionId} onChange={(event) => setQuestionId(event.target.value)} />
          </Field>
          <Field label="笔记" hint="可空">
            <Area value={notes} onChange={(event) => setNotes(event.target.value)} />
          </Field>
          <Button type="submit">加入错题</Button>
        </form>
      </Card>

      <Section title="新的" items={fresh} onReview={reviewMistake} onMaster={(id) => masterMistake(id, true)} onDelete={deleteMistake} />
      <Section title="复习中" items={reviewing} onReview={reviewMistake} onMaster={(id) => masterMistake(id, true)} onDelete={deleteMistake} />
      <Section title="已掌握" items={mastered} onReview={reviewMistake} onMaster={(id) => masterMistake(id, false)} onDelete={deleteMistake} mastered />
    </div>
  );
}

function Section({
  title,
  items,
  onReview,
  onMaster,
  onDelete,
  mastered = false,
}: {
  title: string;
  items: { id: string; date: string; part: Part; reason: Reason; category: string; questionId: string; notes: string; reviewCount: number; nextReview: string }[];
  onReview: (id: string) => void;
  onMaster: (id: string) => void;
  onDelete: (id: string) => void;
  mastered?: boolean;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold">
        {title} · {items.length}
      </h2>
      {items.length === 0 ? <p className="mt-2 text-sm text-muted">还没有。</p> : null}
      <ul className="mt-3 grid gap-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-line bg-card p-4">
            <MistakeRow itemDate={formatCN(item.date)} part={item.part} reason={REASON_LABEL[item.reason]} tag={item.category} count={item.reviewCount} notes={item.notes} questionId={item.questionId} />
            <p className="mt-2 text-xs text-muted">{mastered ? "已掌握" : `下次 ${item.nextReview}`}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {mastered ? null : <Button variant="soft" onClick={() => onReview(item.id)}>复习了一次</Button>}
              <Button variant="ghost" onClick={() => onMaster(item.id)}>
                {mastered ? "移回复习" : "已掌握"}
              </Button>
              <Button variant="ghost" onClick={() => onDelete(item.id)}>
                删除
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MistakeRow({
  itemDate,
  part,
  reason,
  tag,
  count,
  notes,
  questionId,
}: {
  itemDate: string;
  part: string;
  reason: string;
  tag: string;
  count: number;
  notes: string;
  questionId: string;
}) {
  return (
    <div>
      <p className="font-semibold">
        {part === "V" ? `词汇 · ${tag}` : `Part ${part} · ${reason} · ${tag}`}
      </p>
      <p className="mt-1 text-sm text-muted">
        {itemDate}
        {questionId ? ` · ${questionId}` : ""} · 复习 {count} 次
      </p>
      {notes ? <p className="mt-2 text-sm leading-6">{notes}</p> : null}
    </div>
  );
}
