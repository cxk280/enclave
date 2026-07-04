import { describe, expect, it } from "vitest";
import {
  getAuditSummary,
  listAuditEntries,
  recordAnalysis,
} from "./audit";

describe("audit trail", () => {
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

  it("records an upload + inference pair on analysis, attributed to an operator", () => {
    const before = listAuditEntries().length;
    recordAnalysis({
      timestamp: "2026-07-04T13:00:00",
      subjectId: "SUBJ-9999",
      regionId: "af-south-1",
      hash: "abc123…d4",
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
  });
});
