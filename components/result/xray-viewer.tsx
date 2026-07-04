import type { ImagingFinding } from "@/lib/types";

/** Rib arc paths for the stylized chest film (viewer-left + mirrored right). */
const RIBS = [
  "M148 92 Q96 96 60 128",
  "M148 112 Q92 118 54 152",
  "M148 134 Q90 142 52 178",
  "M148 156 Q92 166 58 200",
  "M148 178 Q98 190 68 220",
  "M152 92 Q204 96 240 128",
  "M152 112 Q208 118 246 152",
  "M152 134 Q210 142 248 178",
  "M152 156 Q208 166 242 200",
  "M152 178 Q202 190 232 220",
];

/**
 * Stylized PA chest X-ray viewport with detected-region overlays. The anatomy
 * is illustrative (synthetic case, no real image); finding boxes are positioned
 * from each finding's percentage bounding box.
 */
export function XrayViewer({ findings }: { findings: ImagingFinding[] }) {
  const boxed = findings.filter((f) => f.box);

  return (
    <div className="relative aspect-square w-full max-w-[320px] shrink-0 overflow-hidden rounded-lg border border-[#243029] bg-[#0a0e0d]">
      <svg
        viewBox="0 0 300 300"
        className="h-full w-full"
        role="img"
        aria-label="Stylized chest X-ray with detected regions"
      >
        <ellipse cx="150" cy="150" rx="122" ry="136" fill="#12190f" opacity="0.55" />
        <ellipse cx="104" cy="150" rx="46" ry="92" fill="#090d0b" />
        <ellipse cx="196" cy="150" rx="46" ry="92" fill="#090d0b" />
        <rect x="145" y="52" width="10" height="205" rx="5" fill="#26332c" />
        <path d="M58 70 Q104 54 145 72" stroke="#3a4b43" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M242 70 Q196 54 155 72" stroke="#3a4b43" strokeWidth="4" strokeLinecap="round" fill="none" />
        {RIBS.map((d) => (
          <path
            key={d}
            d={d}
            stroke="#2e3d35"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
        ))}
        <path d="M150 150 Q140 246 108 244 Q150 232 150 150Z" fill="#1a231e" opacity="0.7" />
        <path d="M56 232 Q104 204 148 232" stroke="#3a4b43" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M152 234 Q196 206 244 234" stroke="#3a4b43" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>

      <span className="absolute left-2.5 top-2.5 rounded border border-[#2a3833] bg-[#0f1512] px-2 py-1 font-mono text-[11px] text-[#8fa39b]">
        PA · synthetic
      </span>

      {boxed.map((f, i) => {
        const isFinding = f.kind === "finding";
        const color = isFinding ? "#e0a94a" : "#25c089";
        return (
          <div
            key={f.id}
            className="absolute rounded-md border-2"
            style={{
              left: `${f.box!.x}%`,
              top: `${f.box!.y}%`,
              width: `${f.box!.w}%`,
              height: `${f.box!.h}%`,
              borderColor: color,
              borderStyle: isFinding ? "solid" : "dashed",
            }}
          >
            <span
              className="absolute -right-2.5 -top-2.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ backgroundColor: color, color: "#0a0e0d" }}
            >
              {i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}
