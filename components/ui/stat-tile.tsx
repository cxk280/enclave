import { Card } from "./card";
import { Eyebrow } from "./eyebrow";
import { cn } from "@/lib/cn";

export function StatTile({
  value,
  label,
  sub,
  accent = false,
}: {
  value: string;
  label: string;
  sub: string;
  /** Render the value in sovereign green (e.g. the "0 egress events" tile). */
  accent?: boolean;
}) {
  return (
    <Card className="flex flex-1 flex-col gap-1.5 p-[18px]">
      <span
        className={cn(
          "text-[30px] font-bold leading-9 tracking-tight",
          accent ? "text-green" : "text-ink",
        )}
      >
        {value}
      </span>
      <Eyebrow>{label}</Eyebrow>
      <span className="text-[13px] text-ink-secondary">{sub}</span>
    </Card>
  );
}
