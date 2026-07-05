/**
 * Enclave domain types.
 *
 * The sovereignty guarantee is encoded in the types themselves: a residency
 * stamp's `egress` is the literal `"none"` and `externalCalls` the literal `0`,
 * so any future real integration that tried to weaken the guarantee would fail
 * to type-check.
 */

export type ActionType = "upload" | "inference" | "view";

export interface Region {
  /** Vultr region slug, e.g. "af-south-1". */
  id: string;
  city: string;
  country: string;
  /** ISO 3166-1 alpha-2, e.g. "ZA". */
  countryCode: string;
  /** Emoji flag for at-a-glance region identity. */
  flag: string;
  /** Serving GPU class in-region — the production-target spec (this showcase
   *  box is CPU-only; the real node identity is surfaced separately). */
  gpu: string;
  /** IANA timezone for the region, e.g. "Africa/Johannesburg". Used to render
   *  residency timestamps in the region's own local time. */
  timezone: string;
  /** Nominal in-region round-trip latency (ms). The result view shows the
   *  *measured* inference latency; this is the at-a-glance regional figure. */
  latencyMs: number;
  status: "active" | "available";
  /** One-line human summary shown in the region toggle. */
  note: string;
}

/** Real, kernel-derived proof that inference made no external connections.
 *  Measured (not asserted) by reading the process network namespace's open
 *  TCP sockets; degrades to a clearly-flagged static assertion where the
 *  Linux /proc interface is unavailable (e.g. local macOS dev). */
export interface EgressProof {
  /** Established outbound TCP connections to non-loopback hosts. 0 in-region. */
  externalConnections: number;
  /** How the number was obtained: "/proc/net/tcp" (real) or "static" (fallback). */
  measuredVia: "/proc/net/tcp" | "static";
  /** True when a real kernel measurement was taken (Linux); false on fallback. */
  live: boolean;
}

/** Real identity of the serving node, probed from the host at request time. */
export interface NodeInfo {
  /** OS hostname of the sovereign node. */
  host: string;
  /** CPU model string, e.g. "AMD EPYC ...". */
  cpu: string;
  /** Logical CPU count. */
  cpuCount: number;
  /** Total memory in MB. */
  memMb: number;
  /** Process uptime in seconds. */
  uptimeSeconds: number;
  /** OS platform, e.g. "linux". */
  platform: string;
}

/** The money-shot artifact: proof of where inference happened. */
export interface ResidencyStamp {
  regionId: string;
  regionCity: string;
  regionCountry: string;
  /** Production-target GPU class (this showcase box is CPU-only — see `node`). */
  gpu: string;
  /** Real serving node identity, probed from the host at inference time. */
  node: NodeInfo;
  operator: string;
  /** The guarantee — always "none". */
  egress: "none";
  /** The guarantee — always 0 (the app initiates no external calls). */
  externalCalls: 0;
  /** Real kernel-measured proof backing the `externalCalls` guarantee. */
  egressProof: EgressProof;
  /** Measured wall-clock latency of this inference, in ms (real, not nominal). */
  latencyMs: number;
  /** "sha256:…" cryptographic stamp over case + region + timestamp. */
  auditHash: string;
  /** ISO-8601 timestamp of inference. */
  timestamp: string;
  /** IANA timezone of the serving region, e.g. "Africa/Johannesburg". */
  timezone: string;
}

export interface CodeSuggestion {
  system: "ICD-10" | "CPT";
  code: string;
  label: string;
  /** 0..1 model confidence. */
  confidence: number;
}

export interface ImagingFinding {
  id: string;
  label: string;
  confidence: number;
  /** "finding" highlights amber; "negative" (reassuring) highlights green. */
  kind: "finding" | "negative";
  /** Bounding box as percentages of the X-ray viewport, when localizable. */
  box?: { x: number; y: number; w: number; h: number };
}

export interface NoteSummary {
  narrative: string;
  problems: string[];
  medications: string[];
}

export interface AnalysisResult {
  caseId: string;
  subjectId: string;
  summary: NoteSummary;
  codes: CodeSuggestion[];
  imaging: {
    modality: string;
    findings: ImagingFinding[];
  };
  residency: ResidencyStamp;
}

export interface AuditEntry {
  id: string;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Display time "HH:MM:SS". */
  time: string;
  operator: string;
  action: ActionType;
  subjectId: string;
  regionId: string;
  /** The guarantee — always "none". */
  egress: "none";
  /** Truncated chained hash for the table, e.g. "9f2a1c…c71b". */
  hash: string;
  /** Full 64-hex chained digest: sha256(prevFullHash | this entry's fields).
   *  Chaining makes the log tamper-evident and independently verifiable. */
  fullHash: string;
}

export interface AuditSummary {
  totalAccesses: number;
  distinctOperators: number;
  egressEvents: number;
  regionsTouched: number;
  /** The distinct region ids actually present in the log (for the "regions
   *  touched" tile — so its label matches its count instead of naming only the
   *  currently-pinned region). */
  regions: string[];
  /** The currently-serving region — used for the "no data left <region>" copy. */
  regionId: string;
  regionCity: string;
}
