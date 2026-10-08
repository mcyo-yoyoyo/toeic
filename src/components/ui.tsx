import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ink" | "ghost" | "soft" | "paper";
}) {
  const styles = {
    primary: "bg-accent text-white hover:bg-accent/90",
    ink: "bg-ink text-paper hover:bg-ink/90",
    ghost: "bg-transparent text-ink hover:bg-ink/5",
    soft: "bg-accent-soft text-accent hover:bg-accent-soft/70",
    paper: "bg-white text-ink hover:bg-white/90",
  }[variant];
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        styles,
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  children,
  className,
  padded = true,
  ...props
}: HTMLAttributes<HTMLElement> & { padded?: boolean }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-card", padded && "p-5", className)} {...props}>
      {children}
    </section>
  );
}

export function Bar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={width} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        {hint ? <span className="text-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-base outline-none focus:border-accent",
        props.className,
      )}
    />
  );
}

export function Area(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-base outline-none focus:border-accent",
        props.className,
      )}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-base outline-none focus:border-accent",
        className,
      )}
    />
  );
}
