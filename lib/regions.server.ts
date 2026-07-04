import "server-only";
import { cookies } from "next/headers";
import { getRegionById, REGION_COOKIE } from "./regions";
import type { Region } from "./types";

/** Resolve the serving region from the request cookie (server-only). */
export async function getServingRegion(): Promise<Region> {
  const store = await cookies();
  return getRegionById(store.get(REGION_COOKIE)?.value);
}
