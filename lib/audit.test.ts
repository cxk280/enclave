import { describe, expect, it } from "vitest";
import {
  addAuditEntry,
  getAuditSummary,
  listAuditEntries,
  recordAnalysis,
  verifyAuditChain,
} from "./audit";

describe("audit trail", () => {
  it("seeds UTC-qualified timestamps so region-local rendering is machine-independent", () => {
    // Runs before any test injects rows, so this is the pristine seed set.
    for (const e of listAuditEntries()) {
      expect(e.timestamp.endsWith("Z")).toBe(true);
    }
  });

  it("orders entries newest-first", () => {
    const entries = listAuditEntries();
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].timestamp >= entries[i].timestamp).toBe(true);
    }
  });

  it("always reports zero egress events, and every entry is egress:none", () => {
    expect(getAuditSummary().egressEvents).toBe(0);
    for (const e of listAuditEntries()) {
      expect(e.egress).toBe("none");
    }
  });

  it("has real hashes (not fabricated) and a valid, tamper-evident chain", () => {
    expect(verifyAuditChain()).toBe(true);
    for (const e of listAuditEntries()) {
      expect(e.fullHash).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("summary count reflects the real logged events, with no fabricated baseline", () => {
    const summary = getAuditSummary();
    expect(summary.totalAccesses).toBe(listAuditEntries().length);
  });

  it("regions-touched enumerates the real distinct regions, matching the count", () => {
    const summary = getAuditSummary();
    const distinct = [...new Set(listAuditEntries().map((e) => e.regionId))].sort();
    expect(summary.regions).toEqual(distinct);
    expect(summary.regionsTouched).toBe(distinct.length);
  });

  it("records an upload + inference pair on analysis, attributed to an operator", () => {
    const before = listAuditEntries().length;
    recordAnalysis({
      timestamp: "2026-07-04T13:00:00",
      subjectId: "SUBJ-9999",
      regionId: "af-south-1",
    });
    const after = listAuditEntries();
    expect(after.length).toBe(before + 2);
    expect(after[0].egress).toBe("none");
    expect(
      after
        .slice(0, 2)
        .map((e) => e.action)
        .sort(),
    ).toEqual(["inference", "upload"]);
    expect(after[0].operator).toBeTruthy();
    // the chain is still valid after appending
    expect(verifyAuditChain()).toBe(true);
  });

  it("bounds memory: the store is capped and the retained window still verifies", () => {
    for (let i = 0; i < 700; i++) {
      addAuditEntry({
        timestamp: "2026-07-04T12:00:00",
        operator: "N. Dlamini",
        action: "view",
        subjectId: "SUBJ-1",
        regionId: "af-south-1",
      });
    }
    expect(listAuditEntries().length).toBeLessThanOrEqual(500);
    expect(verifyAuditChain()).toBe(true);
  });
});
