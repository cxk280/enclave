"use client";

import {
  Check,
  Cpu,
  Image as ImageIcon,
  Lock,
  ShieldCheck,
  Unplug,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { InfoCard } from "@/components/settings/info-card";
import { useRegion } from "@/components/shell/region-provider";

export default function SettingsPage() {
  const { region, regions, setRegion } = useRegion();

  return (
    <div className="flex justify-center p-4 sm:p-8">
      <div className="flex w-full max-w-[920px] flex-col gap-5 py-4">
        {/* header */}
        <div>
          <Eyebrow tone="green">Settings</Eyebrow>
          <h1 className="text-[22px] font-semibold text-ink">Region & control plane</h1>
          <p className="mt-1 text-[14px] text-ink-secondary">
            Prove and control where the workload runs. Every option here keeps data
            on the sovereign island.
          </p>
        </div>

        {/* region toggle */}
        <Card className="flex flex-col gap-4 p-[22px]">
          <div>
            <h3 className="text-[18px] font-semibold text-ink">Serving region</h3>
            <p className="mt-1 text-[13px] text-ink-muted">
              Switching re-pins the entire workload in-country. The control plane
              never routes through a global cloud during the switch.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            {regions.map((r) => {
              const selected = region.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRegion(r.id)}
                  className={`flex items-center gap-3.5 rounded-md px-4 py-3.5 text-left transition ${
                    selected
                      ? "border-[1.5px] border-green-border bg-green-bg"
                      : "border border-border-subtle bg-surface hover:border-border-strong"
                  }`}
                >
                  <span className="text-[18px]">{r.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-ink">{r.city}</span>
                      <span className="font-mono text-[13px] text-ink-muted">{r.id}</span>
                    </div>
                    <span className="text-[13px] text-ink-secondary">
                      {selected
                        ? `Active · ${r.gpu} · ~${r.latencyMs} ms in-region`
                        : r.note}
                    </span>
                  </div>
                  {selected ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green text-white">
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="h-[22px] w-[22px] rounded-full border-2 border-border-strong" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-green-border bg-green-bg p-3.5">
            <Lock size={18} className="mt-0.5 shrink-0 text-green" />
            <p className="text-[13px] leading-5 text-ink-secondary">
              Re-pinning to any region keeps all PHI on the sovereign island. No
              global control plane is involved in the switch — only in-country
              staff can administer the target region.
            </p>
          </div>
        </Card>

        {/* control plane */}
        <InfoCard
          title="Control plane"
          sub="Read-only · enforced by Vultr Sovereign Cloud."
          rows={[
            {
              icon: UserRound,
              label: "Operator nationality policy",
              value: "Nationals of the host country only",
              pillLabel: "Enforced",
            },
            {
              icon: Unplug,
              label: "Air-gap status",
              value: "Detached from the global control plane",
              pillLabel: "Air-gapped",
            },
            {
              icon: ShieldCheck,
              label: "Network isolation",
              value: "No egress path off the sovereign island",
              pillLabel: "No egress",
            },
          ]}
        />

        {/* in-region models */}
        <InfoCard
          title="In-region models"
          sub="All weights hosted in-region. No external API calls at inference."
          rows={[
            {
              icon: Cpu,
              label: "Clinical LLM",
              value: "Open clinical model · 8B · in-region weights",
              pillLabel: "Local",
            },
            {
              icon: ImageIcon,
              label: "Imaging classifier",
              value: "Chest X-ray finding detector · in-region",
              pillLabel: "Local",
            },
            {
              icon: ShieldCheck,
              label: "External inference calls",
              value: "0 calls leave the region at inference",
              pillLabel: "0 egress",
            },
          ]}
        />
      </div>
    </div>
  );
}
