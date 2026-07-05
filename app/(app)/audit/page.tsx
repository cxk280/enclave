import { AuditBrowser } from "@/components/audit/audit-browser";
import { ExportAudit } from "@/components/audit/export-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StatTile } from "@/components/ui/stat-tile";
import { getAuditSummary, listAuditEntries } from "@/lib/audit";
import { getServingRegion } from "@/lib/regions.server";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const region = await getServingRegion();
  const entries = listAuditEntries();
  const summary = getAuditSummary(region);

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow tone="green">Compliance evidence</Eyebrow>
          <h1 className="mt-1 text-[22px] font-semibold text-ink">Audit trail</h1>
          <p className="mt-1 text-[14px] text-ink-secondary">
            Every PHI access, attributed to an in-country operator. Hand this to the regulator.
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            Demonstration data — synthetic and de-identified.
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
          value={String(summary.egressEvents)}
          label="Egress events"
          sub={`No data left ${summary.regionId}`}
          accent
        />
        <StatTile
          value={String(summary.regionsTouched)}
          label="Regions touched"
          sub={summary.regions.join(" · ")}
        />
      </div>

      <AuditBrowser entries={entries} initialQuery={q ?? ""} />
    </div>
  );
}
