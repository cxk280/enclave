import { describe, expect, it } from "vitest";
import { runInference } from "./mock-inference";
import { REGIONS } from "./regions";

describe("runInference — sovereignty guarantees", () => {
  it("never egresses and makes zero external calls, for every region", async () => {
    for (const region of REGIONS) {
      const r = await runInference(region);
      expect(r.residency.egress).toBe("none");
      expect(r.residency.externalCalls).toBe(0);
      expect(r.residency.regionId).toBe(region.id);
      expect(r.residency.regionCity).toBe(region.city);
      expect(r.residency.auditHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it("returns the synthetic case deterministically", async () => {
    const r = await runInference(REGIONS[0]);
    expect(r.subjectId).toBe("SUBJ-4471");
    expect(r.summary.problems.length).toBeGreaterThan(0);
    expect(r.codes.length).toBeGreaterThan(0);
    expect(r.imaging.findings).toHaveLength(3);
  });
});
