import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { appendFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Persistence is opt-in via ENCLAVE_AUDIT_DIR (the deployed image sets it). This
 * file exercises that mode in an isolated temp dir; the default in-memory
 * behavior is covered by audit.test.ts. Kept in a separate file so vitest's
 * per-file module isolation gives us a clean module load with the env set.
 */
describe("audit persistence (ENCLAVE_AUDIT_DIR set)", () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "enclave-audit-"));
    process.env.ENCLAVE_AUDIT_DIR = dir;
  });
  afterAll(() => {
    delete process.env.ENCLAVE_AUDIT_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it("seeds+persists on a fresh dir, then reloads the SAME log (no re-seed)", async () => {
    vi.resetModules();
    const a = await import("./audit");
    const seeded = a.listAuditEntries().length;
    expect(seeded).toBeGreaterThan(0);
    expect(a.verifyAuditChain()).toBe(true);
    expect(a.getAuditVerification().persisted).toBe(true);

    a.recordAnalysis({
      timestamp: "2026-07-05T10:00:00",
      subjectId: "SUBJ-PERSIST",
      regionId: "af-south-1",
    });
    const afterRecord = a.listAuditEntries().length;
    expect(afterRecord).toBe(seeded + 2);

    // A fresh module load reads the persisted file rather than re-seeding.
    vi.resetModules();
    const b = await import("./audit");
    expect(b.listAuditEntries().length).toBe(afterRecord);
    expect(b.verifyAuditChain()).toBe(true);
    expect(b.listAuditEntries().some((e) => e.subjectId === "SUBJ-PERSIST")).toBe(true);
  });

  it("skips a crash-truncated trailing line without losing the trail or persistence", async () => {
    vi.resetModules();
    const before = (await import("./audit")).listAuditEntries().length;

    // Simulate an append interrupted by a crash: a partial, unparseable line.
    appendFileSync(join(dir, "audit.jsonl"), '{"id":"ae-9999","partial');

    vi.resetModules();
    const after = await import("./audit");
    expect(after.listAuditEntries().length).toBe(before); // corrupt line skipped
    expect(after.getAuditVerification().persisted).toBe(true); // persistence stays ON
    expect(after.verifyAuditChain()).toBe(true); // retained chain still valid
  });

  it("skips valid-JSON-but-wrong-shape lines without crashing at module load", async () => {
    vi.resetModules();
    const before = (await import("./audit")).listAuditEntries().length;

    // Hostile/garbled edits that still parse as JSON but aren't audit entries.
    appendFileSync(join(dir, "audit.jsonl"), "null\n{}\n123\n\"x\"\n[]\n");

    vi.resetModules();
    const after = await import("./audit"); // must NOT throw at import
    expect(after.listAuditEntries().length).toBe(before); // wrong-shape lines skipped
    expect(after.getAuditVerification().persisted).toBe(true);
    expect(after.verifyAuditChain()).toBe(true);
  });
});
