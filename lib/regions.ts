import type { Region } from "./types";

/**
 * Sovereign regions available to the showcase — all in-country GPU regions.
 * Client-safe (no server-only imports); cookie resolution lives in
 * regions.server.ts.
 */
export const REGIONS: Region[] = [
  {
    id: "af-south-1",
    city: "Johannesburg",
    country: "South Africa",
    countryCode: "ZA",
    flag: "🇿🇦",
    gpu: "NVIDIA L40S",
    latencyMs: 18,
    status: "active",
    note: "Sovereign primary · Johannesburg",
  },
  {
    id: "af-south-2",
    city: "Cape Town",
    country: "South Africa",
    countryCode: "ZA",
    flag: "🇿🇦",
    gpu: "NVIDIA L40S",
    latencyMs: 22,
    status: "available",
    note: "Sovereign failover · Cape Town",
  },
  {
    id: "af-east-1",
    city: "Nairobi",
    country: "Kenya",
    countryCode: "KE",
    flag: "🇰🇪",
    gpu: "NVIDIA A100",
    latencyMs: 26,
    status: "available",
    note: "Sovereign · Nairobi, East Africa",
  },
];

export const DEFAULT_REGION_ID = "af-south-1";
export const REGION_COOKIE = "enclave_region";

export function getRegionById(id: string | undefined | null): Region {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}
