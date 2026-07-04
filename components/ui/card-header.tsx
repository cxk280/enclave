import type { LucideIcon } from "lucide-react";
import { Eyebrow } from "./eyebrow";

/** Card title row: green-tinted icon tile + title + optional trailing eyebrow tag. */
export function CardHeader({
  icon: Icon,
  title,
  tag,
}: {
  icon: LucideIcon;
  title: string;
  tag?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md bg-green-bg text-green">
        <Icon size={17} strokeWidth={2} />
      </span>
      <h3 className="text-[18px] font-semibold text-ink">{title}</h3>
      {tag && (
        <>
          <span className="flex-1" />
          <Eyebrow>{tag}</Eyebrow>
        </>
      )}
    </div>
  );
}
