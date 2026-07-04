import { ChevronDown, Search } from "lucide-react";
import { AuditTable } from "@/components/audit/audit-table";
import { ExportAudit } from "@/components/audit/export-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatTile } from "@/components/ui/stat-tile";
import { getAuditSummary, listAuditEntries } from "@/lib/audit";

const FILTERS = ["Region: af-south-1", "Operator: all", "Action: all", "Last 30 days"];

export default function AuditPage() {
  const entries = listAuditEntries();
  const recent = entries.slice(0, 12);
  const summary = getAuditSummary();

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow tone="green">Compliance evidence</Eyebrow>
          <h1 className="mt-1 text-[22px] font-semibold text-ink">Audit trail</h1>
          <p className="mt-1 text-[14px] text-ink-secondary">
            Every PHI access, attributed to an in-country operator. Hand this to the regulator.
          </p>
        </div>
        <ExportAudit />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          value={summary.totalAccesses.toLocaleString()}
          label="Total PHI accesses"
          sub="Last 30 days"
        />
        <StatTile
          value={String(summary.distinctOperators)}
          label="Distinct operators"
          sub="All in-country"
        />
        <StatTile
          value="0"
          label="Egress events"
          sub="No data left af-south-1"
          accent
        />
        <StatTile
          value={String(summary.regionsTouched)}
          label="Regions touched"
          sub={`${summary.regionId} · ${summary.regionCity}`}
        />
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 py-2.5">
          <Search size={16} className="text-ink-muted" />
          <input
            readOnly
            placeholder="Search by subject, operator, or hash"
            className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </div>
        {FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] font-semibold text-ink hover:bg-surface-2"
          >
            {label}
            <ChevronDown size={16} className="text-ink-muted" />
          </button>
        ))}
      </div>

      <AuditTable entries={recent} total={entries.length} />
    </div>
  );
}
