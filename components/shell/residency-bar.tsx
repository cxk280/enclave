"use client";

import Link from "next/link";
import { ChevronDown, Lock } from "lucide-react";
import { useRegion } from "./region-provider";
import { Pill } from "@/components/ui/pill";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * The persistent sovereignty status bar — present on every authenticated view.
 * Shows the serving region (click → Settings to re-pin), the egress guarantee,
 * the in-country operator, and a live in-region heartbeat.
 */
export function ResidencyBar() {
  const { region } = useRegion();

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
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-heartbeat opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-heartbeat" />
            </span>
            <span className="text-[13px] font-medium text-green-text">In-region</span>
            <span className="text-[13px] text-ink-muted">live</span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
