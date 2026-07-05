"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useRegion } from "@/components/shell/region-provider";
import { SAMPLE_CASE } from "@/lib/sample-case";
import { cn } from "@/lib/cn";

function DropZone({
  icon: Icon,
  title,
  hint,
  loadedText,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  loadedText?: string;
  onSelect: () => void;
}) {
  const loaded = !!loadedText;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={loaded}
      className={cn(
        "flex flex-1 flex-col items-center gap-3.5 rounded-lg border-[1.5px] border-dashed p-9 text-center transition",
        loaded
          ? "border-green-border bg-green-bg/40"
          : "cursor-pointer border-border-strong bg-surface hover:border-green-border hover:bg-surface-2",
      )}
    >
      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-green-bg text-green">
        <Icon size={26} strokeWidth={2} />
      </span>
      <div className="text-[18px] font-semibold text-ink">{title}</div>
      {loaded ? (
        <p className="line-clamp-2 max-w-[260px] text-[13px] text-ink-secondary">{loadedText}</p>
      ) : (
        <p className="max-w-[240px] text-[13px] text-ink-muted">{hint}</p>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
        <ShieldCheck size={12} />
        De-identified / synthetic PHI only
      </span>
      <span className="text-[13px] text-ink-muted">
        {loaded ? "Sample loaded" : "Click to load the sample case"}
      </span>
    </button>
  );
}

export default function WorkspacePage() {
  const { region } = useRegion();
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex justify-center p-4 sm:p-8">
      <div className="flex w-full max-w-[1040px] flex-col gap-7 py-6">
        <header>
          <Eyebrow tone="green">New analysis</Eyebrow>
          <h1 className="mt-1.5 text-[30px] font-bold text-ink">Start a new analysis</h1>
          <p className="mt-2 text-[16px] text-ink-secondary">
            Load the sample case to run inference entirely in-region — de-identified,
            synthetic data only.
          </p>
        </header>

        <div className="flex flex-col gap-5 sm:flex-row">
          <DropZone
            icon={FileText}
            title="Clinical note"
            hint="A de-identified, synthetic progress note"
            loadedText={loaded ? SAMPLE_CASE.noteText : undefined}
            onSelect={() => setLoaded(true)}
          />
          <DropZone
            icon={ImageIcon}
            title="Medical image"
            hint="A synthetic PA chest X-ray to triage"
            loadedText={loaded ? "PA chest X-ray · synthetic" : undefined}
            onSelect={() => setLoaded(true)}
          />
        </div>

        <div className="flex items-start gap-3 rounded-md border border-green-border bg-green-bg p-4">
          <Lock size={20} className="mt-0.5 shrink-0 text-green" />
          <div>
            <p className="text-[15px] font-semibold text-green-text">
              Pinned in-region the moment you analyze.
            </p>
            <p className="mt-0.5 text-[13px] text-ink-secondary">
              This case is pinned to {region.city} ({region.id}). No copy is created outside
              the sovereign region, and there is no egress path off the island.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="secondary" onClick={() => setLoaded(true)}>
            <Zap size={18} />
            Load sample case
          </Button>
          {/* A real link so it works even before hydration (e.g. on slow 3G);
              ?fresh=1 tells the result view to start a genuinely new analysis. */}
          <Link
            href="/workspace/result?fresh=1"
            className={buttonClasses("primary")}
          >
            Analyze in-region
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
