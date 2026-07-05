import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ActionType, AuditEntry, AuditSummary } from "./types";
import { shortHash } from "./hash";
import { getRegionById } from "./regions";
import { OPERATORS } from "./sample-case";

/**
 * HASH-CHAINED audit log for the showcase.
 *
 * Every entry's `fullHash` is a real SHA-256 over the *previous* entry's hash
 * plus this entry's fields, so the log is append-only and tamper-evident:
 * altering or dropping any row breaks every subsequent hash. `verifyAuditChain`
 * recomputes the whole chain from genesis — the "cryptographic audit stamp" is
 * therefore verifiable, not decorative.
 *
 * PERSISTENCE: when `ENCLAVE_AUDIT_DIR` is set (the deployed Docker image sets
 * it to a region-locked, app-owned dir), the log is an append-only JSONL file
 * on that node's disk — so real analyses genuinely accrue and survive a
 * restart, and the trail on screen is a real record rather than seeded data.
 * When the env var is unset (local dev, unit tests) it stays purely in-memory,
 * as before. Either way the seed baseline is small and page-labeled as
 * demonstration data; a production deployment would use a signed WORM store
 * (see PLAN.md "target architecture").
 */

const GENESIS = "0".repeat(64);

/** Cap on the in-memory window so an unauthenticated analyze loop can't grow the
 *  process unboundedly. Older entries are evicted from memory; the retained
 *  window stays chain-verifiable (see verifyAuditChain). The on-disk log is
 *  append-only and keeps every row. */
const MAX_ENTRIES = 500;
let evicted = 0;

// Persistence target: enabled only when the env var is present.
const AUDIT_DIR = process.env.ENCLAVE_AUDIT_DIR;
const AUDIT_FILE = AUDIT_DIR ? join(AUDIT_DIR, "audit.jsonl") : null;
let persistent = false;

let counter = 0;
const nextId = () => `ae-${(++counter).toString().padStart(4, "0")}`;

function timeOf(iso: string): string {
  return iso.slice(11, 19); // "2026-07-04T12:41:07" -> "12:41:07"
}

type ChainInput = {
  timestamp: string;
  operator: string;
  action: ActionType;
  subjectId: string;
  regionId: string;
};

/** Shape-guard a value parsed from the on-disk log. A line can be valid JSON yet
 *  the wrong shape (e.g. a hostile `null`/`{}` edit); adopting it unchecked would
 *  crash at module load. Treat such lines like corrupt lines and skip them. */
function isAuditEntry(x: unknown): x is AuditEntry {
  if (typeof x !== "object" || x === null) return false;
  const e = x as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.fullHash === "string" &&
    typeof e.timestamp === "string" &&
    typeof e.regionId === "string" &&
    typeof e.operator === "string"
  );
}

function chainHash(prevFullHash: string, e: ChainInput): string {
  return createHash("sha256")
    .update(
      [prevFullHash, e.timestamp, e.operator, e.action, e.subjectId, e.regionId].join("|"),
    )
    .digest("hex");
}

const store: AuditEntry[] = [];
let headHash = GENESIS;

/** Append one already-built entry to the on-disk log (best-effort; a read-only
 *  filesystem simply degrades to in-memory rather than crashing a request). */
function persist(entry: AuditEntry): void {
  if (!persistent || !AUDIT_FILE) return;
  try {
    appendFileSync(AUDIT_FILE, `${JSON.stringify(entry)}\n`);
  } catch {
    persistent = false;
  }
}

/** Load and adopt the persisted log (oldest-first) if persistence is on. */
function loadFromDisk(): AuditEntry[] {
  if (!AUDIT_DIR || !AUDIT_FILE) return [];
  try {
    mkdirSync(AUDIT_DIR, { recursive: true });
    persistent = true;
    if (!existsSync(AUDIT_FILE)) return [];
    const entries: AuditEntry[] = [];
    for (const line of readFileSync(AUDIT_FILE, "utf8").split("\n")) {
      if (!line) continue;
      try {
        const parsed: unknown = JSON.parse(line);
        // Skip a corrupt/partial line OR a valid-JSON-but-wrong-shape line (e.g.
        // a hostile `null`/`{}` edit) instead of discarding the whole trail or
        // crashing at boot. A trailing partial line — the common case — drops
        // cleanly and the retained chain stays valid; a mid-file gap is surfaced
        // by verifyAuditChain().
        if (isAuditEntry(parsed)) entries.push(parsed);
      } catch {
        // unparseable line — skip
      }
    }
    return entries;
  } catch {
    persistent = false; // read-only / unreadable FS → in-memory only
    return [];
  }
}

// --- Deterministic synthetic seed (real chained hashes, no fabricated counts) ---

const ACTIONS: ActionType[] = ["inference", "upload", "view"];
const pad = (n: number) => String(n).padStart(2, "0");

function secToTime(s: number): string {
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function isoAt(dayOffset: number, sec: number): string {
  // Base day 2026-07-04 (UTC math is deterministic — no Date.now()). The trailing
  // "Z" marks these as UTC so region-local rendering converts them correctly on
  // any viewer's machine (a naive timestamp would be parsed as viewer-local).
  const d = new Date(Date.UTC(2026, 6, 4) - dayOffset * 86_400_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${secToTime(sec)}Z`;
}

/** A small, page-labeled demonstration baseline so a fresh node isn't empty;
 *  real analyses accrue on top of it. Each row is a genuine chained event. */
const SEED_COUNT = 12;

const seedInputs: ChainInput[] = Array.from({ length: SEED_COUNT }, (_, i) => {
  const dayOffset = Math.floor(i / 6);
  const sec = Math.max(0, 45_667 - (i % 6) * 1_370 - dayOffset * 11);
  return {
    timestamp: isoAt(dayOffset, sec),
    operator: OPERATORS[i % OPERATORS.length],
    action: ACTIONS[i % ACTIONS.length],
    subjectId: `SUBJ-${4471 - Math.floor(i / 2)}`,
    regionId: "af-south-1",
  };
});

function buildEntry(input: ChainInput): AuditEntry {
  headHash = chainHash(headHash, input);
  return {
    id: nextId(),
    ...input,
    time: timeOf(input.timestamp),
    egress: "none",
    hash: shortHash(headHash),
    fullHash: headHash,
  };
}

// --- Initialization: adopt the persisted log, else seed a baseline ---

const loaded = loadFromDisk();
if (loaded.length > 0) {
  // Trust the stored ids + hashes; continue the chain from the last row.
  for (const e of loaded) {
    store.push(e);
    const n = Number(e.id.replace(/\D/g, "")) || 0;
    if (n > counter) counter = n;
  }
  headHash = store[store.length - 1].fullHash;
  if (store.length > MAX_ENTRIES) {
    evicted = store.length - MAX_ENTRIES;
    store.splice(0, evicted);
  }
} else {
  // Fresh node (or in-memory mode): seed oldest-first so each hash covers the
  // prior one, and persist the baseline so a restart reloads it (no re-seed).
  for (const input of [...seedInputs].reverse()) {
    const entry = buildEntry(input);
    store.push(entry);
    persist(entry);
  }
}

export function listAuditEntries(): AuditEntry[] {
  // Newest-first; tie-break by id (desc) so an analysis's `inference` row — the
  // one whose hash is stamped on the result page — sorts above its paired
  // `upload` row (both share a timestamp).
  return [...store].sort(
    (a, b) => b.timestamp.localeCompare(a.timestamp) || b.id.localeCompare(a.id),
  );
}

export function addAuditEntry(input: ChainInput): AuditEntry {
  const entry = buildEntry(input);
  store.push(entry);
  persist(entry);
  if (store.length > MAX_ENTRIES) {
    store.shift();
    evicted++;
  }
  return entry;
}

/** Record the upload + inference pair produced by an analyze request; returns
 *  the inference entry so its chained hash can be shown as the result's stamp
 *  (so the on-screen stamp reconciles with a real row in the trail). */
export function recordAnalysis(input: {
  timestamp: string;
  subjectId: string;
  regionId: string;
}): AuditEntry {
  addAuditEntry({ ...input, operator: OPERATORS[0], action: "upload" });
  return addAuditEntry({ ...input, operator: OPERATORS[0], action: "inference" });
}

/**
 * Verify the retained window is internally consistent: each entry's hash must
 * equal chainHash(previous entry's hash, this entry). If nothing has been
 * evicted, the first entry is also anchored to GENESIS. Returns false if any
 * retained row was altered or dropped out of sequence.
 */
export function verifyAuditChain(): boolean {
  for (let i = 0; i < store.length; i++) {
    if (i === 0) {
      // Once entries have been evicted, store[0]'s real predecessor is gone, so
      // it serves as a trusted anchor and can't be recomputed from genesis.
      if (evicted === 0 && chainHash(GENESIS, store[0]) !== store[0].fullHash) {
        return false;
      }
      continue;
    }
    if (chainHash(store[i - 1].fullHash, store[i]) !== store[i].fullHash) {
      return false;
    }
  }
  return true;
}

/** Self-contained description so a regulator can independently recompute and
 *  verify the hash chain from an export, without inside knowledge. */
export function getAuditVerification() {
  return {
    algorithm: "SHA-256",
    genesisHash: GENESIS,
    chainRule:
      "fullHash[n] = SHA-256(fullHash[n-1] | timestamp | operator | action | subjectId | regionId), '|'-joined; fullHash[0] chains from genesisHash",
    chainValid: verifyAuditChain(),
    persisted: persistent,
    note: "Demonstration data — synthetic and de-identified.",
  };
}

export function getAuditSummary(region?: { id: string; city: string }): AuditSummary {
  const serving = region ?? getRegionById(undefined);
  const regions = [...new Set(store.map((e) => e.regionId))].sort();
  return {
    totalAccesses: store.length,
    distinctOperators: new Set(store.map((e) => e.operator)).size,
    egressEvents: store.filter((e) => e.egress !== "none").length,
    regionsTouched: regions.length,
    regions,
    regionId: serving.id,
    regionCity: serving.city,
  };
}
