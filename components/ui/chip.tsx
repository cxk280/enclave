import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Chip({
  tone = "neutral",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "green" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-[11px] py-1.5 text-[13px]",
        tone === "green"
          ? "border-green-border bg-green-bg text-green-text"
          : "border-border-subtle bg-surface-2 text-ink-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
