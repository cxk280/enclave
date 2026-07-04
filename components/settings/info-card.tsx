import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";

export interface InfoRow {
  icon: LucideIcon;
  label: string;
  value: string;
  pillLabel: string;
}

/** Header + green-tile row list, mirroring the MetaRow pattern from residency-panel.tsx. */
export function InfoCard({
  title,
  sub,
  rows,
}: {
  title: string;
  sub: string;
  rows: InfoRow[];
}) {
  return (
    <Card className="flex flex-col">
      <div className="px-[22px] py-[18px]">
        <h3 className="text-[18px] font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-[13px] text-ink-muted">{sub}</p>
      </div>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center gap-3.5 border-t border-border-subtle px-[22px] py-[15px]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-green-bg text-green">
            <row.icon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <Eyebrow>{row.label}</Eyebrow>
            <div className="text-[15px] font-semibold text-ink">{row.value}</div>
          </div>
          <Pill tone="green" dot>
            {row.pillLabel}
          </Pill>
        </div>
      ))}
    </Card>
  );
}
