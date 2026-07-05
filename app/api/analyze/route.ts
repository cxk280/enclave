import { NextResponse } from "next/server";
import { getServingRegion } from "@/lib/regions.server";
import { runInference } from "@/lib/mock-inference";
import { recordAnalysis } from "@/lib/audit";

/**
 * POST /api/analyze — run in-region inference on the current serving region and
 * append the resulting access to the tamper-evident audit trail. Makes no
 * external calls; the response always carries `egress: "none"` and
 * `externalCalls: 0`.
 */
export async function POST() {
  const region = await getServingRegion();
  const result = await runInference(region);

  const entry = recordAnalysis({
    timestamp: result.residency.timestamp,
    subjectId: result.subjectId,
    regionId: region.id,
  });
  // Stamp the result with the *inference audit row's* chained hash so the
  // "cryptographic audit stamp" on screen reconciles with a real trail row.
  result.residency.auditHash = `sha256:${entry.fullHash}`;

  return NextResponse.json(result);
}
