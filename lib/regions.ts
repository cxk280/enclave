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
    note: "Active · NVIDIA L40S · ~18 ms in-region",
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
    note: "Available · sovereign · in-country failover",
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
    note: "Available · sovereign · East Africa",
  },
];

export const DEFAULT_REGION_ID = "af-south-1";
export const REGION_COOKIE = "enclave_region";

export function getRegionById(id: string | undefined | null): Region {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
}
