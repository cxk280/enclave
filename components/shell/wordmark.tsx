import { ShieldCheck } from "lucide-react";

/** Enclave wordmark — shield-check mark + name + sovereign eyebrow. */
export function Wordmark({ subtitle = true }: { subtitle?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <ShieldCheck className="shrink-0 text-green" size={26} strokeWidth={2} />
      <div className="leading-none">
        <div className="text-[18px] font-semibold text-ink">Enclave</div>
        {subtitle && <div className="eyebrow mt-0.5 text-green-text">Sovereign AI</div>}
      </div>
    </div>
  );
}
