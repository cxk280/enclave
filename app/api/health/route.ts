import { NextResponse } from "next/server";
import { getServingRegion } from "@/lib/regions.server";
import { getNodeInfo } from "@/lib/node-info";
import { readEgressProof } from "@/lib/egress";

/**
 * GET /api/health — liveness probe AND live node telemetry (no external calls).
 *
 * Reports the REAL serving region (from the request cookie, defaulting to the
 * sovereign primary), the real process uptime + node identity, and a real
 * kernel-measured egress proof. The Docker HEALTHCHECK only needs the 200; the
 * extra fields drive the in-region heartbeat in the status bar.
 */
export async function GET() {
  const region = await getServingRegion();
  const node = getNodeInfo();
  const egress = readEgressProof();
  return NextResponse.json({
    status: "ok",
    region: region.id,
    regionCity: region.city,
    uptimeSeconds: node.uptimeSeconds,
    node,
    egress,
  });
}
