import type { AuditEntry } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { getRegionById } from "@/lib/regions";

const ACTION_DOT_CLASS: Record<AuditEntry["action"], string> = {
  inference: "bg-green",
  upload: "bg-amber",
  view: "",
};

const COLUMNS = [
  "TIME",
  "OPERATOR",
  "ACTION",
  "DATA SUBJECT",
  "REGION",
  "EGRESS",
  "AUDIT HASH",
] as const;

/** Read-only table of PHI accesses, attributed to in-country operators. */
export function AuditTable({
  entries,
  total,
}: {
  entries: AuditEntry[];
  total?: number;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-2">
              {COLUMNS.map((col) => (
                <th key={col} className="px-4 py-3 text-left">
                  <span className="eyebrow text-ink-muted">{col}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-border-subtle">
                <td className="px-4 py-3 align-middle">
                  <span className="font-mono text-[13px] text-ink">{entry.time}</span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green" />
                    <span className="text-[14px] text-ink">{entry.operator}</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-ink-secondary">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${ACTION_DOT_CLASS[entry.action]}`}
                      style={
                        entry.action === "view"
                          ? { backgroundColor: "var(--ink-muted)" }
                          : undefined
                      }
                    />
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="font-mono text-[13px] text-ink-secondary">
                    {entry.subjectId}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center gap-2">
                    <span>{getRegionById(entry.regionId).flag}</span>
                    <span className="text-[14px] text-ink-secondary">{entry.regionId}</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-middle">
                  <Pill tone={entry.egress === "none" ? "green" : "danger"}>
                    {entry.egress}
                  </Pill>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="font-mono text-[13px] text-ink-muted">{entry.hash}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total !== undefined && total > entries.length && (
        <div className="border-t border-border-subtle px-4 py-3 text-[13px] text-ink-muted">
          Showing the {entries.length} most recent of {total.toLocaleString()} accesses ·
          export for the full region-locked log.
        </div>
      )}
    </Card>
  );
}
