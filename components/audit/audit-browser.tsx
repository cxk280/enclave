"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { AuditEntry } from "@/lib/types";
import { getRegionById } from "@/lib/regions";
import { formatEntryClock, formatEntryDate } from "@/lib/format-time";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";

const ACTION_DOT_CLASS: Record<AuditEntry["action"], string> = {
  inference: "bg-green",
  upload: "bg-amber",
  view: "",
};

const COLUMNS = [
  "TIMESTAMP",
  "OPERATOR",
  "ACTION",
  "DATA SUBJECT",
  "REGION",
  "EGRESS",
  "AUDIT HASH",
] as const;

const RECENT = 12;

/**
 * Interactive audit trail: a functional search (by subject, operator, or hash)
 * so a regulator can reconcile any stamp against a row — even one that has
 * scrolled past the most-recent window — plus the full date on every row.
 */
export function AuditBrowser({
  entries,
  initialQuery = "",
}: {
  entries: AuditEntry[];
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const query = q.trim().toLowerCase();

  const matches = query
    ? entries.filter((e) =>
        `${e.operator} ${e.subjectId} ${e.action} ${e.hash} ${e.fullHash}`
          .toLowerCase()
          .includes(query),
      )
    : entries.slice(0, RECENT);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 py-2.5">
          <Search size={16} className="text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by subject, operator, or hash"
            aria-label="Search the audit trail"
            className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </div>
      </div>

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
              {matches.map((entry) => (
                <tr key={entry.id} className="border-t border-border-subtle">
                  <td className="px-4 py-3 align-middle">
                    <div className="font-mono text-[13px] leading-tight text-ink">
                      {formatEntryClock(entry.timestamp, entry.regionId)}
                    </div>
                    <div className="font-mono text-[11px] text-ink-muted">
                      {formatEntryDate(entry.timestamp, entry.regionId)}
                    </div>
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
              {matches.length === 0 && (
                <tr className="border-t border-border-subtle">
                  <td colSpan={COLUMNS.length} className="px-4 py-6 text-center text-[13px] text-ink-muted">
                    No accesses match “{q}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border-subtle px-4 py-3 text-[13px] text-ink-muted">
          {query
            ? `${matches.length} match${matches.length === 1 ? "" : "es"} for “${q}” across all ${entries.length.toLocaleString()} accesses.`
            : entries.length > matches.length
              ? `Showing the ${matches.length} most recent of ${entries.length.toLocaleString()} accesses · search by subject, operator, or hash to reconcile any row, or export the full region-locked log.`
              : null}
        </div>
      </Card>
    </div>
  );
}
