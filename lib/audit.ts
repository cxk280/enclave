import type { ActionType, AuditEntry, AuditSummary } from "./types";
import { OPERATORS } from "./sample-case";

/**
 * In-memory, in-process audit log for the showcase. Seeded with deterministic
 * synthetic rows; new analyses append here. Every entry is attributed to an
 * in-country operator and always records `egress: "none"`.
 *
 * NOTE: this store is per-process and resets on restart — fine for a demo, but
 * a production deployment would back it with a region-locked, append-only store
 * (e.g. encrypted Object Storage). Called out in the PR description.
 */

let counter = 0;
const nextId = () => `ae-${(++counter).toString().padStart(4, "0")}`;

function timeOf(iso: string): string {
  // "2026-07-04T12:41:07" -> "12:41:07"
  return iso.slice(11, 19);
}

function seed(
  timestamp: string,
  operator: string,
  action: ActionType,
  subjectId: string,
  hash: string,
): AuditEntry {
  return {
    id: nextId(),
    timestamp,
    time: timeOf(timestamp),
    operator,
    action,
    subjectId,
    regionId: "af-south-1",
    egress: "none",
    hash,
  };
}

const store: AuditEntry[] = [
  seed("2026-07-04T12:41:07", "N. Dlamini", "inference", "SUBJ-4471", "9f2a1c…c71b"),
  seed("2026-07-04T12:41:05", "N. Dlamini", "upload", "SUBJ-4471", "3b8e77…a12f"),
  seed("2026-07-04T12:39:22", "T. Botha", "view", "SUBJ-4470", "c14d90…88ee"),
  seed("2026-07-04T12:38:11", "A. Naidoo", "inference", "SUBJ-4469", "77aa02…4c31"),
  seed("2026-07-04T12:35:48", "S. Pillay", "view", "SUBJ-4468", "e7b4c1…0d9a"),
  seed("2026-07-04T12:33:10", "M. Khumalo", "upload", "SUBJ-4467", "1f0a55…b7c2"),
  seed("2026-07-04T12:31:59", "L. van Wyk", "inference", "SUBJ-4466", "aa93ee…2210"),
];

/** Base count so the headline reads realistically ("~1,248 accesses"). */
const BASE_ACCESSES = 1241;

export function listAuditEntries(): AuditEntry[] {
  return [...store].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function addAuditEntry(input: {
  timestamp: string;
  operator: string;
  action: ActionType;
  subjectId: string;
  regionId: string;
  hash: string;
}): AuditEntry {
  const entry: AuditEntry = {
    id: nextId(),
    timestamp: input.timestamp,
    time: timeOf(input.timestamp),
    operator: input.operator,
    action: input.action,
    subjectId: input.subjectId,
    regionId: input.regionId,
    egress: "none",
    hash: input.hash,
  };
  store.unshift(entry);
  return entry;
}

/** Record the upload + inference pair produced by an analyze request. */
export function recordAnalysis(input: {
  timestamp: string;
  subjectId: string;
  regionId: string;
  hash: string;
}): void {
  addAuditEntry({ ...input, operator: OPERATORS[0], action: "upload" });
  addAuditEntry({ ...input, operator: OPERATORS[0], action: "inference" });
}

export function getAuditSummary(): AuditSummary {
  const regions = new Set(store.map((e) => e.regionId));
  return {
    totalAccesses: BASE_ACCESSES + store.length,
    distinctOperators: OPERATORS.length,
    egressEvents: 0,
    regionsTouched: regions.size,
    regionId: "af-south-1",
    regionCity: "Johannesburg",
  };
}
