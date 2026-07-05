import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Cpu,
  Hash,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ResidencyStamp } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";

function MetaRow({
  icon: Icon,
  label,
  value,
  first,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  first?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-[13px] ${first ? "" : "border-t border-border-subtle"}`}
    >
      <Icon size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-green" />
      <div className="min-w-0">
        <Eyebrow>{label}</Eyebrow>
        <div className="text-[15px] font-semibold text-ink">{value}</div>
      </div>
    </div>
  );
}

/** The spotlight: proof of where and how the case was processed. */
export function ResidencyPanel({ residency }: { residency: ResidencyStamp }) {
  const hex = residency.auditHash.replace(/^sha256:/, "");
  const stamp = `sha256:${hex.slice(0, 10)}… ${hex.slice(-6)}`;
  const when = `${residency.timestamp.slice(0, 10)} ${residency.timestamp.slice(11, 19)} ${residency.timezone}`;

  return (
    <div className="flex w-full flex-col gap-3.5 lg:w-96">
      {/* verified stamp */}
      <div className="rounded-lg border-[1.5px] border-green-border bg-green-bg p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-green text-white">
            <ShieldCheck size={20} strokeWidth={2.2} />
          </span>
          <Eyebrow tone="green">Residency verified</Eyebrow>
        </div>
        <h2 className="mt-3 text-[22px] font-semibold leading-7 text-ink">
          Processed in {residency.regionCity}
        </h2>
        <p className="mt-1 text-[14px] text-ink-secondary">
          Data never left {residency.regionCountry}.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          Egress: none
        </span>
      </div>

      {/* attribution */}
      <Card className="flex flex-col">
        <MetaRow icon={Cpu} label="Serving GPU" value={`${residency.regionId} · ${residency.gpu}`} first />
        <MetaRow icon={UserRound} label="Control plane operator" value={residency.operator} />
        <MetaRow icon={ShieldCheck} label="Model weights" value="In-region · no external calls" />
      </Card>

      {/* zero-egress counter */}
      <Card className="flex items-center gap-3.5 p-[18px]">
        <span className="text-[30px] font-bold leading-none text-green">
          {residency.externalCalls}
        </span>
        <div>
          <div className="text-[15px] font-semibold text-ink">
            External API calls at inference
          </div>
          <div className="text-[13px] text-ink-muted">
            Every token generated on sovereign hardware.
          </div>
        </div>
      </Card>

      {/* audit stamp */}
      <Card className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-ink-muted" />
          <Eyebrow>Cryptographic audit stamp</Eyebrow>
        </div>
        <div className="rounded-md border border-border-subtle bg-surface-2 p-2.5 font-mono text-[11px] leading-5">
          <div className="text-ink-secondary">{stamp}</div>
          <div className="text-ink-muted">{when}</div>
        </div>
        <Link
          href={`/audit?q=${hex.slice(0, 12)}`}
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-green-text hover:underline"
        >
          View in audit trail
          <ArrowRight size={16} />
        </Link>
      </Card>

      {/* hyperscaler contrast */}
      <details className="group rounded-md border border-dashed border-border-strong bg-surface">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3.5">
          <span className="h-2 w-2 rounded-full bg-amber" />
          <span className="text-[15px] font-semibold text-ink-secondary">
            What a hyperscaler would do
          </span>
          <ChevronRight
            size={18}
            className="ml-auto text-ink-muted transition group-open:rotate-90"
          />
        </summary>
        <div className="border-t border-border-subtle px-4 py-3.5">
          <Pill tone="amber" className="mb-2">
            Egress risk
          </Pill>
          <p className="text-[13px] leading-5 text-ink-secondary">
            With a typical hyperscaler, PHI would traverse a cross-border egress path
            to a control plane hosted outside the jurisdiction, administered by foreign
            support staff — the pattern hard data-localization law is designed to prevent.
          </p>
        </div>
      </details>
    </div>
  );
}
