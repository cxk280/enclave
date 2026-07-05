"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { useRegion } from "@/components/shell/region-provider";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProcessingState } from "./processing-state";
import { ClinicalOutput } from "./clinical-output";
import { ResidencyPanel } from "./residency-panel";

/** Session cache so a refresh/back-nav re-displays the SAME analysis instead of
 *  re-running it (which would add phantom rows to the audit trail). Cleared by
 *  the Workspace "Analyze in-region" action to start a genuinely new analysis. */
export const RESULT_CACHE_KEY = "enclave:lastResult";

/** Orchestrates the result view: run inference, show the in-region loading
 *  state, then reveal the clinical output + residency spotlight. */
export function ResultView() {
  const { region } = useRegion();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // The ref guard makes a single visit fire exactly one analysis, even under
    // React StrictMode's double-invoked effect. We deliberately do NOT tear the
    // request down on cleanup: StrictMode's simulated unmount would otherwise
    // cancel the only in-flight fetch and the result would never render.
    if (started.current) return;
    started.current = true;

    // Arriving via the Workspace "Analyze" link (?fresh=1) forces a brand-new
    // analysis; strip the param so a later refresh re-displays (not re-runs) it.
    if (new URLSearchParams(window.location.search).get("fresh") === "1") {
      sessionStorage.removeItem(RESULT_CACHE_KEY);
      window.history.replaceState(null, "", "/workspace/result");
    }

    // A refresh / back-nav re-displays the cached analysis — no new inference,
    // no new audit rows. Only a fresh "Analyze" (which clears the cache) re-runs.
    const cached = sessionStorage.getItem(RESULT_CACHE_KEY);
    if (cached) {
      try {
        setResult(JSON.parse(cached) as AnalysisResult);
        return;
      } catch {
        sessionStorage.removeItem(RESULT_CACHE_KEY);
      }
    }

    const startedAt = Date.now();
    fetch("/api/analyze", { method: "POST" })
      .then((r) => {
        if (!r.ok) throw new Error(`analyze failed: ${r.status}`);
        return r.json();
      })
      .then((data: AnalysisResult) => {
        sessionStorage.setItem(RESULT_CACHE_KEY, JSON.stringify(data));
        // Hold the processing beat briefly so the demo reads clearly.
        const wait = Math.max(0, 1400 - (Date.now() - startedAt));
        setTimeout(() => setResult(data), wait);
      })
      .catch(() => setFailed(true));
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
          <Link href="/workspace" className={buttonClasses("secondary")}>
            Back to workspace
          </Link>
        </Card>
      </div>
    );
  }

  if (!result) return <ProcessingState regionCity={region.city} />;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 lg:flex-row">
      <ClinicalOutput result={result} />
      <ResidencyPanel residency={result.residency} />
    </div>
  );
}
