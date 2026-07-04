import { Check, Loader2, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

type StepState = "done" | "run" | "queued";

const STEPS: { label: string; state: StepState }[] = [
  { label: "Clinical note summarized", state: "done" },
  { label: "Problems & medications extracted", state: "done" },
  { label: "Coding assistance generated", state: "done" },
  { label: "Imaging findings — analyzing X-ray", state: "run" },
  { label: "Assembling residency stamp", state: "queued" },
];

function StepIcon({ state }: { state: StepState }) {
  if (state === "done")
    return (
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-green text-white">
        <Check size={12} strokeWidth={3} />
      </span>
    );
  if (state === "run")
    return <Loader2 size={18} className="animate-spin text-green" />;
  return <span className="h-[18px] w-[18px] rounded-full border-2 border-border-strong" />;
}

const STATE_LABEL: Record<StepState, string> = {
  done: "done",
  run: "running",
  queued: "queued",
};

/** The in-region loading state, shown while inference runs. */
export function ProcessingState({ regionCity }: { regionCity: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <Card className="flex w-full max-w-[560px] flex-col items-center gap-5 p-9 text-center">
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-green-bg">
          <Loader2 size={40} className="animate-spin text-green" />
        </span>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-[22px] font-semibold text-ink">Processing in-region…</h2>
          <p className="max-w-[430px] text-[14px] text-ink-secondary">
            Running the clinical LLM and imaging classifier on the {regionCity} GPU.
            No data leaves the region.
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-md border border-border-subtle bg-surface-2">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center gap-3 px-4 py-3 ${i ? "border-t border-border-subtle" : ""}`}
            >
              <StepIcon state={s.state} />
              <span
                className={`flex-1 text-left text-[14px] ${s.state === "queued" ? "text-ink-muted" : "text-ink"}`}
              >
                {s.label}
              </span>
              <span
                className={`eyebrow ${s.state === "queued" ? "text-ink-muted" : "text-green-text"}`}
              >
                {STATE_LABEL[s.state]}
              </span>
            </div>
          ))}
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-border bg-green-bg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-green-text">
          <Lock size={13} />
          Pinned to {regionCity} · Egress: none
        </span>
      </Card>
    </div>
  );
}
