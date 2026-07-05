import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/shell/wordmark";
import { Button, buttonClasses } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** Public landing page — the sovereign-AI pitch and entry point into the demo. */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-4 py-4 sm:px-10 sm:py-5">
        <Wordmark />
        <div className="flex items-center gap-6">
          <Link
            href="#difference"
            className="text-[15px] font-semibold text-ink-secondary hover:text-ink"
          >
            How it works
          </Link>
          <Link
            href="/audit"
            className="text-[15px] font-semibold text-ink-secondary hover:text-ink"
          >
            Audit
          </Link>
          <Link href="/workspace" className={buttonClasses("primary")}>
            Enter the demo
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto flex max-w-[900px] flex-col items-center gap-6 px-4 py-16 text-center sm:px-10 sm:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-border bg-green-bg px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          <span className="eyebrow text-green-text">
            Vultr Sovereign Cloud · in-region GPU
          </span>
        </span>

        <h1 className="text-[34px] font-bold leading-[1.1] tracking-tight text-ink sm:text-[52px]">
          Clinical AI that never leaves the country.
        </h1>

        <p className="max-w-[720px] text-[16px] leading-relaxed text-ink-secondary">
          Note summarization, coding assistance, and medical-image triage —
          processed on GPUs inside your borders, under a control plane
          air-gapped from the global cloud and operated only by nationals of
          the host country.
        </p>

        <div className="flex gap-3">
          <Link href="/workspace" className={buttonClasses("primary")}>
            Enter the demo <ArrowRight size={18} />
          </Link>
          <Button variant="secondary">See the guarantee</Button>
        </div>

        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span>Air-gapped control plane</span>
          <span
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: "var(--ink-muted)" }}
          />
          <span>Nationals-only operators</span>
          <span
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: "var(--ink-muted)" }}
          />
          <span>Egress: none</span>
        </div>
      </section>

      <section
        id="difference"
        className="mx-auto flex max-w-[1120px] flex-col gap-7 px-4 pb-24 pt-6 scroll-mt-8 sm:px-10"
      >
        <div className="flex flex-col items-center gap-2">
          <Eyebrow tone="green" className="text-center">
            The difference
          </Eyebrow>
          <h2 className="text-center text-[30px] font-bold text-ink">
            Where your data actually goes
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-[18px] rounded-lg border-[1.5px] border-green-border bg-surface p-6">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="text-green" size={26} />
              <h3 className="text-[22px] font-semibold text-ink">Enclave</h3>
              <span className="flex-1" />
              <Pill tone="green">Sovereign</Pill>
            </div>

            <div className="flex flex-col gap-2.5 rounded-md border-[1.5px] border-dashed border-green-border bg-green-bg p-4">
              <Eyebrow tone="green">Sovereign island · af-south-1</Eyebrow>
              <div className="flex flex-wrap gap-2">
                {["PHI", "GPU inference", "Control plane"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md border border-green-border bg-surface px-2.5 py-1.5 text-[13px] font-medium text-ink-secondary"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-green" />
                <span className="text-[15px] font-semibold text-green-text">
                  No egress path off the island
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {[
                "In-region GPU inference on sovereign hardware",
                "Air-gapped, fully-detached control plane",
                "Administered only by nationals of the host country",
                "Egress: none — a legally-defensible guarantee",
              ].map((line) => (
                <div key={line} className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green" />
                  <span className="text-[14px] text-ink">{line}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[18px] rounded-lg border-[1.5px] border-border-strong bg-surface p-6">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="text-amber" size={26} />
              <h3 className="text-[22px] font-semibold text-ink">
                Typical hyperscaler
              </h3>
              <span className="flex-1" />
              <Pill tone="amber">Egress risk</Pill>
            </div>

            <div className="flex items-center gap-3 rounded-md bg-surface-2 p-4">
              <span className="rounded-md border border-border-subtle bg-surface px-3 py-2.5 text-[15px] font-semibold text-ink">
                Your PHI
              </span>
              <span className="flex flex-col items-center gap-1">
                <ArrowRight className="text-amber" size={28} />
                <span className="eyebrow text-amber">egress</span>
              </span>
              <span className="flex-1 rounded-md border border-dashed border-amber bg-amber-bg px-3 py-2.5 text-[15px] font-semibold text-amber">
                Offshore control plane
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {[
                "Control plane hosted outside the jurisdiction",
                "Foreign support staff hold standing access",
                "A cross-border egress path exists by design",
              ].map((line) => (
                <div key={line} className="flex items-start gap-2.5">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber" />
                  <span className="text-[14px] text-ink-secondary">{line}</span>
                </div>
              ))}
              <div className="flex items-start gap-2.5">
                <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />
                <span className="text-[14px] font-medium text-danger">
                  Fails hard health-data localization law
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
