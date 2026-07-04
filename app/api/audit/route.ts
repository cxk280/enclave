import { NextResponse } from "next/server";
import { getAuditSummary, listAuditEntries } from "@/lib/audit";

/** GET /api/audit — the compliance evidence: every PHI access + summary tiles. */
export async function GET() {
  return NextResponse.json({
    entries: listAuditEntries(),
    summary: getAuditSummary(),
  });
}
