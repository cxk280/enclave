import { createHash } from "node:crypto";
import type { ActionType, AuditEntry, AuditSummary } from "./types";
import { shortHash } from "./hash";
import { OPERATORS } from "./sample-case";

/**
 * In-memory, in-process, HASH-CHAINED audit log for the showcase.
 *
 * Every entry's `fullHash` is a real SHA-256 over the *previous* entry's hash
 * plus this entry's fields, so the log is append-only and tamper-evident:
 * altering or dropping any row breaks every subsequent hash. `verifyAuditChain`
 * recomputes the whole chain from genesis — the "cryptographic audit stamp" is
 * therefore verifiable, not decorative.
 *
 * NOTE: this store is per-process and resets on restart — fine for a demo. A
 * production deployment would persist it to a region-locked, WORM/append-only,
 * signed store (see PLAN.md "target architecture"). See PR notes.
 */

const GENESIS = "0".repeat(64);

/** Cap on the in-memory log so an unauthenticated analyze loop can't grow the
 *  process unboundedly. Older entries are evicted; the retained window stays
 *  chain-verifiable (see verifyAuditChain). */
const MAX_ENTRIES = 500;
let evicted = 0;

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

function chainHash(prevFullHash: string, e: ChainInput): string {
  return createHash("sha256")
    .update(
      [prevFullHash, e.timestamp, e.operator, e.action, e.subjectId, e.regionId].join("|"),
    )
    .digest("hex");
}

// --- Deterministic synthetic seed (real chained hashes, no fabricated counts) ---

const ACTIONS: ActionType[] = ["inference", "upload", "view"];
const pad = (n: number) => String(n).padStart(2, "0");

function secToTime(s: number): string {
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function isoAt(dayOffset: number, sec: number): string {
  // Base day 2026-07-04 (UTC math is deterministic — no Date.now()).
  const d = new Date(Date.UTC(2026, 6, 4) - dayOffset * 86_400_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${secToTime(sec)}`;
}

const SEED_COUNT = 42;

/** Newest-first synthetic accesses; each is a genuine event, not a counter. */
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

// Chain oldest-first so each hash covers the prior one; store stays ascending.
const store: AuditEntry[] = [];
let headHash = GENESIS;
for (const input of [...seedInputs].reverse()) {
  headHash = chainHash(headHash, input);
  store.push({
    id: nextId(),
    ...input,
    time: timeOf(input.timestamp),
    egress: "none",
    hash: shortHash(headHash),
    fullHash: headHash,
  });
}

export function listAuditEntries(): AuditEntry[] {
  return [...store].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function addAuditEntry(input: ChainInput): AuditEntry {
  headHash = chainHash(headHash, input);
  const entry: AuditEntry = {
    id: nextId(),
    ...input,
    time: timeOf(input.timestamp),
    egress: "none",
    hash: shortHash(headHash),
    fullHash: headHash,
  };
  store.push(entry);
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

export function getAuditSummary(): AuditSummary {
  return {
    totalAccesses: store.length,
    distinctOperators: new Set(store.map((e) => e.operator)).size,
    egressEvents: store.filter((e) => e.egress !== "none").length,
    regionsTouched: new Set(store.map((e) => e.regionId)).size,
    regionId: "af-south-1",
    regionCity: "Johannesburg",
  };
}
