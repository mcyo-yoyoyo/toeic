"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useStore } from "@/components/provider";
import { Button } from "@/components/ui";
import { openTask } from "@/lib/open-task";

const NAV = [
  { href: "/", label: "今天" },
  { href: "/today", label: "任务" },
  { href: "/practice", label: "练习" },
  { href: "/roadmap", label: "路线" },
  { href: "/mistakes", label: "错题" },
  { href: "/progress", label: "进度" },
  { href: "/resources", label: "资料" },
];

const MOBILE = [
  { href: "/", label: "今天" },
  { href: "/practice", label: "练习" },
  { href: "/roadmap", label: "路线" },
  { href: "/mistakes", label: "错题" },
  { href: "/progress", label: "进度" },
  { href: "/resources", label: "资料" },
];

function active(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { derived } = useStore();

  function goNext() {
    if (!derived.next || derived.allDone) {
      router.push("/roadmap");
      return;
    }
    openTask(derived.next, (href) => router.push(href));
  }

  return (
    <div className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-card px-4 py-6 lg:flex">
        <Link href="/" className="px-2">
          <p className="font-display text-2xl leading-none">TOEIC 300 OS</p>
          <p className="mt-2 text-sm text-muted">不用选。做就是了。</p>
        </Link>
        <nav className="mt-8 grid gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${active(pathname, item.href) ? "bg-accent-soft text-accent" : "text-ink hover:bg-paper"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-2 text-sm text-muted">
          <Link href="/settings" className="font-semibold text-ink">
            设置
          </Link>
          <p className="mt-2">数据只在这台浏览器里。</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
          <Link href="/" className="font-display text-xl">
            TOEIC 300 OS
          </Link>
          <Link href="/settings" className="text-sm font-semibold">
            设置
          </Link>
        </header>
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-ink px-4 py-3 text-paper lg:static">
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-paper/70">下一步</p>
            <p className="truncate text-sm font-semibold md:text-base">{derived.nextLabel}</p>
          </div>
          <Button variant="paper" className="shrink-0" onClick={goNext}>
            {derived.allDone ? "看明天" : "开始"}
          </Button>
        </div>
        <main className="mx-auto w-full max-w-5xl px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 md:px-8 md:py-8 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-line bg-card px-1 pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] lg:hidden">
        {MOBILE.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-11 items-center justify-center rounded-xl px-1 text-center text-[11px] font-semibold sm:text-xs ${active(pathname, item.href) ? "text-accent" : "text-muted"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
