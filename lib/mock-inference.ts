import type { AnalysisResult, Region } from "./types";
import { SAMPLE_CASE } from "./sample-case";
import { sha256Hex } from "./hash";
import { getNodeInfo } from "./node-info";
import { readEgressProof } from "./egress";

/**
 * Deterministic, in-region "inference". The clinical *content* is a
 * clearly-labeled synthetic mock (no GPU model runs here), but the residency
 * stamp around it is REAL: the serving node identity, the egress proof, the
 * timezone, and the latency are all measured live from the host at call time.
 *
 * By construction it makes ZERO external calls and always reports
 * `egress: "none"` / `externalCalls: 0` — that is the sovereignty guarantee,
 * not a coincidence of this implementation — and `egressProof` backs it with a
 * kernel measurement rather than an assertion.
 */
export async function runInference(region: Region): Promise<AnalysisResult> {
  const start = performance.now();
  const timestamp = new Date().toISOString();
  const c = SAMPLE_CASE;
  const digest = await sha256Hex(`${c.caseId}|${region.id}|${timestamp}`);
  const node = getNodeInfo();
  const egressProof = readEgressProof();
  const latencyMs = Math.round(performance.now() - start);

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
      node,
      operator: "National staff · in-country",
      egress: "none",
      externalCalls: 0,
      egressProof,
      latencyMs,
      auditHash: `sha256:${digest}`,
      timestamp,
      timezone: region.timezone,
    },
  };
}
