import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Small-caps label used above titles and on residency/audit surfaces. */
export function Eyebrow({
  tone = "muted",
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { tone?: "muted" | "green" }) {
  return (
    <p
      className={cn(
        "eyebrow",
        tone === "green" ? "text-green-text" : "text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}
