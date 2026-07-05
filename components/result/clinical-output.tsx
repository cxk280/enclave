import { FileText, Image as ImageIcon, Tag } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card-header";
import { Chip } from "@/components/ui/chip";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { Eyebrow } from "@/components/ui/eyebrow";
import { XrayViewer } from "./xray-viewer";

/** Left column of the result view: note summary, coding, imaging findings. */
export function ClinicalOutput({ result }: { result: AnalysisResult }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
      <header>
        <div className="flex items-center gap-2">
          <Eyebrow tone="green">Result</Eyebrow>
          <Eyebrow>· Case #{result.caseId}</Eyebrow>
        </div>
        <h1 className="mt-1.5 text-[22px] font-semibold text-ink">Analysis complete</h1>
        <p className="mt-1 text-[14px] text-ink-secondary">
          Synthetic case · 54 y/o · progress note + {result.imaging.modality} ·
          analyzed {result.residency.timestamp.slice(11, 19)} {result.residency.timezone}
        </p>
      </header>

      <Card className="flex flex-col gap-3.5 p-[18px]">
        <CardHeader icon={FileText} title="Clinical note summary" tag="LLM · in-region" />
        <p className="text-[14px] leading-6 text-ink-secondary">{result.summary.narrative}</p>
        <div className="flex flex-col gap-2">
          <Eyebrow>Extracted problems</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {result.summary.problems.map((p) => (
              <Chip key={p} tone="green">
                {p}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Eyebrow>Medications</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {result.summary.medications.map((m) => (
              <Chip key={m}>{m}</Chip>
            ))}
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-[18px]">
        <CardHeader icon={Tag} title="Coding assistance" tag="Suggested" />
        <div className="flex flex-col">
          {result.codes.map((c, i) => (
            <div
              key={c.code}
              className={`flex items-center gap-3 py-3 ${i ? "border-t border-border-subtle" : ""}`}
            >
              <span className="rounded-[7px] border border-green-border bg-green-bg px-2.5 py-1.5 font-mono text-[13px] text-green-text">
                {c.code}
              </span>
              <span className="min-w-0 flex-1 text-[14px] text-ink">{c.label}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                {Math.round(c.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3.5 p-[18px]">
        <CardHeader
          icon={ImageIcon}
          title="Imaging findings"
          tag={`${result.imaging.modality} · classifier`}
        />
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-[18px]">
          <XrayViewer findings={result.imaging.findings} />
          <div className="flex flex-1 flex-col gap-4">
            {result.imaging.findings.map((f, i) => (
              <div key={f.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      f.kind === "negative"
                        ? "bg-green-bg text-green-text"
                        : "bg-amber-bg text-amber"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[14px] text-ink">{f.label}</span>
                  <span className="text-[13px] font-medium text-ink-secondary">
                    {Math.round(f.confidence * 100)}%
                  </span>
                </div>
                <ConfidenceBar
                  value={f.confidence}
                  tone={f.kind === "negative" ? "green" : "amber"}
                  label={`${f.label}, confidence ${Math.round(f.confidence * 100)} percent`}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
