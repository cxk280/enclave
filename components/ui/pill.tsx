import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type PillTone = "green" | "amber" | "danger" | "neutral";

const tones: Record<PillTone, string> = {
  green: "bg-green-bg text-green-text border-green-border",
  amber: "bg-amber-bg text-amber border-amber/30",
  danger: "bg-danger-bg text-danger border-danger/30",
  neutral: "bg-surface-2 text-ink-secondary border-border-subtle",
};

export function Pill({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: PillTone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}
