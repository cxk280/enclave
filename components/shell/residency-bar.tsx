"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Lock } from "lucide-react";
import { useRegion } from "./region-provider";
import { Pill } from "@/components/ui/pill";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** Compact human uptime that visibly advances on every ~10s poll (so the live
 *  heartbeat reads as live within a glance): "45s", "3m 20s", "1h 05m". */
function formatUptime(s: number): string {
  const p = (n: number) => String(n).padStart(2, "0");
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${p(s % 60)}s`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ${p(Math.floor((s % 3600) / 60))}m`;
  return `${Math.floor(s / 86_400)}d ${p(Math.floor((s % 86_400) / 3600))}h`;
}

/** Poll the same-origin health endpoint (CSP-allowed) for a REAL liveness +
 *  uptime signal, replacing the former decorative CSS-only heartbeat. */
function useNodeHeartbeat(): { live: boolean; uptimeSeconds: number | null } {
  const [live, setLive] = useState(false);
  const [uptimeSeconds, setUptime] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/health", { cache: "no-store" });
        if (!r.ok) throw new Error(`health ${r.status}`);
        const d = await r.json();
        if (!active) return;
        setUptime(typeof d.uptimeSeconds === "number" ? d.uptimeSeconds : null);
        setLive(true);
      } catch {
        if (active) setLive(false);
      }
    };
    poll();
    const pollId = setInterval(poll, 10_000);
    // Advance the displayed uptime locally every second so the "live" badge
    // visibly ticks between polls; each 10s poll re-syncs it to the server's
    // real uptime, so it stays honest, not a free-running fake clock.
    const tickId = setInterval(() => {
      setUptime((u) => (u === null ? u : u + 1));
    }, 1_000);
    return () => {
      active = false;
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, []);

  return { live, uptimeSeconds };
}

/**
 * The persistent sovereignty status bar — present on every authenticated view.
 * Shows the serving region (click → Settings to re-pin), the egress guarantee,
 * the in-country operator, and a live in-region heartbeat (a real health poll).
 */
export function ResidencyBar() {
  const { region } = useRegion();
  const { live, uptimeSeconds } = useNodeHeartbeat();

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border-subtle bg-surface px-4 py-2.5 sm:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface-2 px-2.5 py-1.5 transition hover:border-border-strong"
          aria-label={`Serving region ${region.city} (${region.id}). Change region.`}
        >
          <span className="text-[15px] leading-none">{region.flag}</span>
          <span className="text-[15px] font-semibold text-ink">{region.city}</span>
          <span className="text-[13px] text-ink-muted">{region.id}</span>
          <ChevronDown size={16} className="text-ink-muted" />
        </Link>
        <Pill tone="green" dot>
          Egress: none
        </Pill>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3.5">
        <div className="hidden items-center gap-3.5 md:flex">
          <div className="flex items-center gap-1.5">
            <Lock size={15} className="text-green" />
            <span className="text-[13px] text-ink-muted">Operator:</span>
            <span className="text-[13px] font-semibold text-ink">national staff</span>
          </div>
          <span className="h-4 w-px bg-border-strong" />
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5" aria-hidden>
              {live && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-heartbeat opacity-60" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live ? "bg-heartbeat" : "bg-ink-muted"}`}
              />
            </span>
            <span className="text-[13px] font-medium text-green-text">In-region</span>
            <span className="text-[13px] text-ink-muted">
              {live ? (uptimeSeconds !== null ? `live · up ${formatUptime(uptimeSeconds)}` : "live") : "reconnecting…"}
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
