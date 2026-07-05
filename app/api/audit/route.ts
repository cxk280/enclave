import { NextResponse } from "next/server";
import {
  getAuditSummary,
  getAuditVerification,
  listAuditEntries,
} from "@/lib/audit";

/** GET /api/audit — the compliance evidence: every PHI access, the summary
 *  tiles, and a self-contained verification descriptor for the hash chain. */
export async function GET() {
  return NextResponse.json({
    entries: listAuditEntries(),
    summary: getAuditSummary(),
    verification: getAuditVerification(),
  });
}
