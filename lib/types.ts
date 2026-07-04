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
  /** Serving GPU class in-region. */
  gpu: string;
  latencyMs: number;
  status: "active" | "available";
  /** One-line human summary shown in the region toggle. */
  note: string;
}

/** The money-shot artifact: proof of where inference happened. */
export interface ResidencyStamp {
  regionId: string;
  regionCity: string;
  regionCountry: string;
  gpu: string;
  operator: string;
  /** The guarantee — always "none". */
  egress: "none";
  /** The guarantee — always 0. */
  externalCalls: 0;
  /** "sha256:…" cryptographic stamp over case + region + timestamp. */
  auditHash: string;
  /** ISO-8601 timestamp of inference. */
  timestamp: string;
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
  /** Truncated audit hash for the table, e.g. "9f2a1c…c71b". */
  hash: string;
}

export interface AuditSummary {
  totalAccesses: number;
  distinctOperators: number;
  egressEvents: number;
  regionsTouched: number;
  regionId: string;
  regionCity: string;
}
