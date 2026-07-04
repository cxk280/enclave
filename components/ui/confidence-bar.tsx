import { cn } from "@/lib/cn";

/** Horizontal confidence meter. Amber for findings, green for reassuring negatives. */
export function ConfidenceBar({
  value,
  tone = "amber",
  className,
}: {
  /** 0..1 */
  value: number;
  tone?: "amber" | "green";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn("h-[7px] w-full overflow-hidden rounded-full bg-track", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full", tone === "green" ? "bg-green" : "bg-amber")}
        style={{ width: `${Math.max(pct, 3)}%` }}
      />
    </div>
  );
}
