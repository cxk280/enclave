"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SAMPLE_CASE } from "@/lib/sample-case";
import { cn } from "@/lib/cn";

function DropZone({
  icon: Icon,
  title,
  hint,
  format,
  loadedText,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  format: string;
  loadedText?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center gap-3.5 rounded-lg border-[1.5px] border-dashed p-9 text-center transition",
        loadedText ? "border-green-border bg-green-bg/40" : "border-border-strong bg-surface",
      )}
    >
      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-green-bg text-green">
        <Icon size={26} strokeWidth={2} />
      </span>
      <div className="text-[18px] font-semibold text-ink">{title}</div>
      {loadedText ? (
        <p className="line-clamp-2 max-w-[260px] text-[13px] text-ink-secondary">{loadedText}</p>
      ) : (
        <p className="max-w-[240px] text-[13px] text-ink-muted">{hint}</p>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-muted">
        <ShieldCheck size={12} />
        De-identified / synthetic PHI only
      </span>
      <span className="text-[13px] text-ink-muted">{loadedText ? "Sample loaded" : format}</span>
    </div>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex justify-center p-8">
      <div className="flex w-full max-w-[1040px] flex-col gap-7 py-6">
        <header>
          <Eyebrow tone="green">New analysis</Eyebrow>
          <h1 className="mt-1.5 text-[30px] font-bold text-ink">Start a new analysis</h1>
          <p className="mt-2 text-[16px] text-ink-secondary">
            Upload a clinical note and a medical image to run inference entirely in-region.
          </p>
        </header>

        <div className="flex flex-col gap-5 sm:flex-row">
          <DropZone
            icon={FileText}
            title="Clinical note"
            hint="Paste text or drop a plain-text note"
            format=".txt · paste supported"
            loadedText={loaded ? SAMPLE_CASE.noteText : undefined}
          />
          <DropZone
            icon={ImageIcon}
            title="Medical image"
            hint="Drop a chest X-ray to triage"
            format=".png · .jpg · .dcm"
            loadedText={loaded ? "PA chest X-ray · synthetic" : undefined}
          />
        </div>

        <div className="flex items-start gap-3 rounded-md border border-green-border bg-green-bg p-4">
          <Lock size={20} className="mt-0.5 shrink-0 text-green" />
          <div>
            <p className="text-[15px] font-semibold text-green-text">
              Pinned in-region the moment you analyze.
            </p>
            <p className="mt-0.5 text-[13px] text-ink-secondary">
              This case is pinned to Johannesburg (af-south-1). No copy is created outside
              the sovereign region, and there is no egress path off the island.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => setLoaded(true)}>
            <Zap size={18} />
            Load sample case
          </Button>
          <Button onClick={() => router.push("/workspace/result")}>
            Analyze in-region
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
