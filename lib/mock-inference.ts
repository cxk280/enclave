import type { AnalysisResult, Region } from "./types";
import { SAMPLE_CASE } from "./sample-case";
import { sha256Hex } from "./hash";

/**
 * Deterministic, in-region "inference". Returns the synthetic sample case
 * stamped with the serving region and a cryptographic audit hash.
 *
 * By construction it makes ZERO external calls and always reports
 * `egress: "none"` / `externalCalls: 0` — that is the sovereignty guarantee,
 * not a coincidence of this implementation.
 */
export async function runInference(region: Region): Promise<AnalysisResult> {
  const timestamp = new Date().toISOString();
  const c = SAMPLE_CASE;
  const digest = await sha256Hex(`${c.caseId}|${region.id}|${timestamp}`);

  return {
    caseId: c.caseId,
    subjectId: c.subjectId,
    summary: c.summary,
    codes: [...c.codes],
    imaging: { modality: c.imaging.modality, findings: [...c.imaging.findings] },
    residency: {
      regionId: region.id,
      regionCity: region.city,
      regionCountry: region.country,
      gpu: region.gpu,
      operator: "National staff · in-country",
      egress: "none",
      externalCalls: 0,
      auditHash: `sha256:${digest}`,
      timestamp,
      timezone: "SAST",
    },
  };
}
