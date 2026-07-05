import { NextResponse } from "next/server";

/** GET /api/health — liveness probe for the platform (no external calls). */
export function GET() {
  return NextResponse.json({ status: "ok", region: "af-south-1" });
}
