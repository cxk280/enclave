"use client";

import { useRef, useState } from "react";
import { Check, Download } from "lucide-react";

/** Downloads the full audit log (entries + summary) as JSON — the literal
 *  "hand this to the regulator" artifact, generated in-region from same-origin
 *  data (no external call). Shows a brief confirmation after download. */
export function ExportAudit() {
  const [exported, setExported] = useState(false);
  const busy = useRef(false);

  async function onExport() {
    if (busy.current) return; // guard against double-click → double download
    busy.current = true;
    try {
      const res = await fetch("/api/audit");
      if (!res.ok) return;
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "enclave-audit-af-south-1.json";
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 2500);
    } catch {
      // Same-origin export; nothing actionable in the demo if it fails.
    } finally {
      busy.current = false;
    }
  }

  return (
    <button
      type="button"
      onClick={onExport}
      className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-4 py-3 text-[15px] font-semibold text-ink hover:bg-surface-2"
    >
      {exported ? (
        <>
          <Check size={18} className="text-green" />
          Exported
        </>
      ) : (
        <>
          <Download size={18} />
          Export for regulator
        </>
      )}
    </button>
  );
}
