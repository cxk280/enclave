"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { useRegion } from "@/components/shell/region-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProcessingState } from "./processing-state";
import { ClinicalOutput } from "./clinical-output";
import { ResidencyPanel } from "./residency-panel";

/** Orchestrates the result view: run inference, show the in-region loading
 *  state, then reveal the clinical output + residency spotlight. */
export function ResultView() {
  const { region } = useRegion();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const started = Date.now();
    fetch("/api/analyze", { method: "POST" })
      .then((r) => {
        if (!r.ok) throw new Error(`analyze failed: ${r.status}`);
        return r.json();
      })
      .then((data: AnalysisResult) => {
        // Hold the processing beat briefly so the demo reads clearly.
        const wait = Math.max(0, 1400 - (Date.now() - started));
        setTimeout(() => {
          if (active) setResult(data);
        }, wait);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (failed) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Card className="flex max-w-[440px] flex-col items-center gap-4 p-9 text-center">
          <AlertTriangle size={32} className="text-amber" />
          <div>
            <h2 className="text-[18px] font-semibold text-ink">
              In-region inference didn&apos;t complete
            </h2>
            <p className="mt-1 text-[14px] text-ink-secondary">
              No data left {region.city} — nothing was processed. Start the analysis again.
            </p>
          </div>
          <Link href="/workspace">
            <Button variant="secondary">Back to workspace</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!result) return <ProcessingState regionCity={region.city} />;

  return (
    <div className="flex flex-col gap-6 p-8 lg:flex-row">
      <ClinicalOutput result={result} />
      <ResidencyPanel residency={result.residency} />
    </div>
  );
}
