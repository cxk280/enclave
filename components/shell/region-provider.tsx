"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getRegionById, REGION_COOKIE, REGIONS } from "@/lib/regions";
import type { Region } from "@/lib/types";

interface RegionContextValue {
  region: Region;
  regions: Region[];
  /** Re-pin the workload to a sovereign region. Persists to a cookie so the
   *  server renders the same serving region on the next request. */
  setRegion: (id: string) => void;
}

const RegionContext = createContext<RegionContextValue | null>(null);

export function RegionProvider({
  initialRegionId,
  children,
}: {
  initialRegionId: string;
  children: ReactNode;
}) {
  const [regionId, setRegionId] = useState(initialRegionId);

  const setRegion = useCallback((id: string) => {
    setRegionId(id);
    document.cookie = `${REGION_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo<RegionContextValue>(
    () => ({ region: getRegionById(regionId), regions: REGIONS, setRegion }),
    [regionId, setRegion],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within a RegionProvider");
  return ctx;
}
