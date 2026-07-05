import { NextResponse } from "next/server";
import {
  getAuditSummary,
  getAuditVerification,
  listAuditEntries,
} from "@/lib/audit";
import { getServingRegion } from "@/lib/regions.server";

/** GET /api/audit — the compliance evidence: every PHI access, the summary
 *  tiles, and a self-contained verification descriptor for the hash chain. */
export async function GET() {
  const region = await getServingRegion();
  return NextResponse.json({
    entries: listAuditEntries(),
    summary: getAuditSummary(region),
    verification: getAuditVerification(),
  });
}
