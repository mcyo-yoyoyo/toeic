"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { useStore } from "@/components/provider";
import { Button, Card } from "@/components/ui";
import { dayDeck } from "@/lib/bank";
import type { Choice, ReadingSet, VocabCard } from "@/lib/bank";
import { PART5, PART6, PART7, PART7_MULTI, VOCAB } from "@/lib/bank";
import type { Category, Part, Reason } from "@/lib/types";

export function PracticeHome() {
  const packs = [
    { href: "/practice/diagnostic", title: "开课诊断", meta: "10 + 4 + 3 题", detail: "没有完整卷时，用这个看起点。结果会写成短诊断。" },
    { href: "/practice/vocab", title: "词表", meta: `${VOCAB.length} 个词，每天 12 个`, detail: "按天换一组。不认识的记入错题。" },
    { href: "/practice/part5", title: "Part 5", meta: `${PART5.length} 题，每天 8 题`, detail: "第一次做到的题才计入正确率。" },
    { href: "/practice/part6", title: "Part 6", meta: `${PART6.length} 篇`, detail: "先读完整段，再填空。" },
    { href: "/practice/part7", title: "Part 7 单篇", meta: `${PART7.length} 篇`, detail: "定位、目的和推断。" },
    { href: "/practice/part7-multi", title: "Part 7 双篇", meta: `${PART7_MULTI.length} 套`, detail: "先看两份文件各是什么，再做跨文档的题。" },
  ];
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5">
      <header>
        <p className="text-sm text-muted">题在门户里，按天换，不必再找一套新的</p>
        <h1 className="mt-2 font-display text-4xl leading-tight">离线练习</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          词库 {VOCAB.length} 个，句子 {PART5.length} 道，Part 6 {PART6.length} 篇，单篇 {PART7.length} 篇，双篇 {PART7_MULTI.length} 套。做过的题再出现，只复习，不改下周安排。完整 100 题仍用你自己的阅读卷。
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {packs.map((pack) => (
          <Link key={pack.href} href={pack.href} className="rounded-2xl border border-line bg-card p-5 active:bg-accent-soft">
            <p className="text-sm text-muted">{pack.meta}</p>
            <h2 className="mt-1 text-2xl font-semibold">{pack.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{pack.detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function VocabRun() {
  const { derived, logDrill, state } = useStore();
  const cards = dayDeck(derived.dayNumber).vocab;
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [left, setLeft] = useState<VocabCard[]>([]);
  const card = cards[index];
  const done = index >= cards.length;
  const liveFresh = cards.filter((item) => !state.seenIds.includes(item.id)).length;
  const frozenFresh = useRef<number | null>(null);
  if (done && frozenFresh.current === null) frozenFresh.current = liveFresh;
  const fresh = done ? (frozenFresh.current ?? liveFresh) : liveFresh;

  if (done) {
    return (
      <Result
        title="这一组词过完了"
        detail={`认识 ${known.length} / ${cards.length}。其中 ${fresh} 个是第一次。不认识的已经记入错题。`}
        onSave={() =>
          logDrill({
            category: "vocabulary",
            questionIds: cards.map((item) => item.id),
            correctIds: known,
            minutes: 8,
            mistakes: left.map((item) => ({
              questionId: item.id,
              part: "V",
              category: item.word,
              reason: "vocabulary",
              notes: item.meaning,
            })),
          })
        }
      />
    );
  }
  if (!card) return null;

  return (
    <Frame title="词表" progress={`${index + 1} / ${cards.length}`} note={`今天这一组。第一次出现 ${fresh} 个。`}>
      <Card className="min-h-56">
        <p className="text-sm text-muted">{card.pos}</p>
        <h2 className="mt-2 break-words font-display text-4xl">{card.word}</h2>
        {shown ? (
          <div className="mt-6">
            <p className="text-xl font-semibold">{card.meaning}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{card.example}</p>
          </div>
        ) : (
          <Button className="mt-8 min-h-12 w-full sm:w-auto" onClick={() => setShown(true)}>
            看释义
          </Button>
        )}
      </Card>
      {shown ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="ink"
            className="min-h-12"
            onClick={() => {
              setKnown((value) => [...value, card.id]);
              setIndex((value) => value + 1);
              setShown(false);
            }}
          >
            认识
          </Button>
          <Button
            variant="soft"
            className="min-h-12"
            onClick={() => {
              setLeft((value) => [...value, card]);
              setIndex((value) => value + 1);
              setShown(false);
            }}
          >
            留下
          </Button>
        </div>
      ) : null}
    </Frame>
  );
}

export function ChoiceRun({
  title,
  items,
  category,
  part,
  reasonForWrong = "grammar",
  onDone,
}: {
  title: string;
  items: Choice[];
  category: Category;
  part: Part;
  reasonForWrong?: Reason;
  onDone?: (result: DrillResult) => void;
}) {
  const { logDrill, state } = useStore();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [wrong, setWrong] = useState<DrillResult["wrong"]>([]);
  const item = items[index];
  const done = index >= items.length;
  const liveFresh = items.filter((question) => !state.seenIds.includes(question.id)).length;
  const frozenFresh = useRef<number | null>(null);
  if (done && frozenFresh.current === null) frozenFresh.current = liveFresh;
  const fresh = done ? (frozenFresh.current ?? liveFresh) : liveFresh;

  if (done) {
    const result = { correct: correctIds.length, ids: items.map((question) => question.id), correctIds, wrong };
    return (
      <Result
        title={`${title} 做完了`}
        detail={`做对 ${result.correct} / ${items.length}。其中 ${fresh} 道是第一次，只有这些计入下周判断。`}
        saveLabel={onDone ? "继续" : "记入进度"}
        onSave={() => {
          if (onDone) onDone(result);
          else {
            logDrill({
              category,
              questionIds: result.ids,
              correctIds: result.correctIds,
              minutes: Math.max(4, items.length),
              mistakes: result.wrong,
            });
          }
        }}
      />
    );
  }
  if (!item) return null;

  return (
    <Frame title={title} progress={`${index + 1} / ${items.length}`} note={`第一次出现 ${fresh} 道。`}>
      <Card>
        <p className="text-lg leading-7">{item.stem}</p>
        <div className="mt-4 grid gap-2">
          {item.options.map((option, optionIndex) => {
            const selected = picked === optionIndex;
            const show = picked !== null;
            const right = optionIndex === item.answer;
            const tone = !show ? "border-line bg-paper" : right ? "border-accent bg-accent-soft" : selected ? "border-warn bg-warn-soft" : "border-line bg-paper";
            return (
              <button
                key={`${item.id}-${optionIndex}`}
                type="button"
                disabled={picked !== null}
                className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-base ${tone}`}
                onClick={() => {
                  setPicked(optionIndex);
                  if (optionIndex === item.answer) setCorrectIds((value) => [...value, item.id]);
                  else {
                    setWrong((value) => [
                      ...value,
                      { questionId: item.id, part, category: item.stem.slice(0, 42), reason: reasonForWrong, notes: item.why },
                    ]);
                  }
                }}
              >
                {String.fromCharCode(65 + optionIndex)}. {option}
              </button>
            );
          })}
        </div>
        {picked !== null ? <p className="mt-4 text-sm leading-6">{item.why}</p> : null}
      </Card>
      {picked !== null ? (
        <Button
          className="min-h-12 w-full sm:w-auto"
          onClick={() => {
            setIndex((value) => value + 1);
            setPicked(null);
          }}
        >
          {index + 1 === items.length ? "看结果" : "下一题"}
        </Button>
      ) : null}
    </Frame>
  );
}

export function PassageRun({ set, category }: { set: ReadingSet; category: Category }) {
  const reason: Reason = set.kind === "part6" ? "grammar" : "comprehension";
  const part: Part = set.kind === "part6" ? "6" : "7";
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      <p className="text-sm text-muted">{set.kind === "part7-multi" ? "先看两份文件各是什么，再做题" : set.kind === "part6" ? "先读完整段，再做题" : "先看题干里要找的信息"}</p>
      <Card>
        <h2 className="text-xl font-semibold">{set.title}</h2>
        <p className="mt-3 whitespace-pre-wrap text-base leading-7">{set.passage}</p>
      </Card>
      <ChoiceRun title={set.kind === "part6" ? "Part 6" : "Part 7"} items={set.questions} category={category} part={part} reasonForWrong={reason} />
    </div>
  );
}

export function DiagnosticRun() {
  const { saveBaseline } = useStore();
  const part5 = PART5.slice(0, 10);
  const part6 = PART6[0];
  const part7 = PART7[0];
  const [step, setStep] = useState(0);
  const [bag, setBag] = useState<DrillResult[]>([]);
  const started = useRef(Date.now());
  if (!part6 || !part7) return null;

  function finish(results: DrillResult[]) {
    const p5 = results[0];
    const p6 = results[1];
    const p7 = results[2];
    const minutes = Math.max(8, Math.round((Date.now() - started.current) / 60000));
    saveBaseline({
      part5Correct: p5?.correct ?? 0,
      part6Correct: p6?.correct ?? 0,
      part7Correct: p7?.correct ?? 0,
      part5Total: part5.length,
      part6Total: part6.questions.length,
      part7Total: part7.questions.length,
      source: "short",
      totalMinutes: minutes,
      remainingMinutes: 0,
      questionIds: results.flatMap((item) => item.ids),
      mistakes: results.flatMap((item) => item.wrong),
    });
  }

  if (step === 0) {
    return (
      <div className="grid gap-4">
        <p className="mx-auto w-full max-w-3xl text-sm leading-6 text-muted">短诊断：10 道 Part 5，再加 1 篇 Part 6 和 1 篇 Part 7。按正确率折算起点，不是 100 题官方卷。</p>
        <ChoiceRun
          title="诊断 · Part 5"
          items={part5}
          category="part5"
          part="5"
          onDone={(result) => {
            setBag([result]);
            setStep(1);
          }}
        />
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="mx-auto grid w-full max-w-3xl gap-4">
        <Card>
          <h2 className="text-xl font-semibold">{part6.title}</h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-7">{part6.passage}</p>
        </Card>
        <ChoiceRun
          title="诊断 · Part 6"
          items={part6.questions}
          category="part6"
          part="6"
          onDone={(result) => {
            setBag((value) => [...value, result]);
            setStep(2);
          }}
        />
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="mx-auto grid w-full max-w-3xl gap-4">
        <Card>
          <h2 className="text-xl font-semibold">{part7.title}</h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-7">{part7.passage}</p>
        </Card>
        <ChoiceRun
          title="诊断 · Part 7"
          items={part7.questions}
          category="part7"
          part="7"
          reasonForWrong="comprehension"
          onDone={(result) => {
            const results = [...bag, result];
            finish(results);
            setBag(results);
            setStep(3);
          }}
        />
      </div>
    );
  }
  const p5 = bag[0]?.correct ?? 0;
  const p6 = bag[1]?.correct ?? 0;
  const p7 = bag[2]?.correct ?? 0;
  return (
    <Result
      title="短诊断已记下"
      detail={`Part 5 ${p5}/10，Part 6 ${p6}/4，Part 7 ${p7}/3。这是练习估算的起点，不是 100 题阅读，也不是官方分数。`}
      saved
    />
  );
}

interface DrillResult {
  correct: number;
  ids: string[];
  correctIds: string[];
  wrong: { questionId: string; part: Part; category: string; reason: Reason; notes: string }[];
}

function Frame({ title, progress, note, children }: { title: string; progress: string; note?: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl">{title}</h1>
        <span className="text-sm tabular-nums text-muted">{progress}</span>
      </div>
      {note ? <p className="text-sm text-muted">{note}</p> : null}
      {children}
    </div>
  );
}

function Result({ title, detail, onSave, saveLabel = "记入进度", saved = false }: { title: string; detail: string; onSave?: () => void; saveLabel?: string; saved?: boolean }) {
  const [wrote, setWrote] = useState(saved);
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      <Card>
        <h1 className="font-display text-4xl leading-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {onSave && !wrote ? (
            <Button
              className="min-h-12"
              onClick={() => {
                onSave();
                setWrote(true);
              }}
            >
            {saveLabel}
            </Button>
          ) : null}
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white">
            回到今天
          </Link>
          <Link href="/practice" className="inline-flex min-h-12 items-center rounded-full px-4 text-sm font-semibold">
            换一组
          </Link>
        </div>
        {wrote && onSave ? <p className="mt-3 text-sm text-muted">{saveLabel === "继续" ? "这一段已记下。" : "已记下。只有第一次做到的题会改变下周安排。"}</p> : null}
      </Card>
    </div>
  );
}
