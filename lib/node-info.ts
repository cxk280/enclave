import os from "node:os";
import type { NodeInfo } from "./types";

/**
 * Real identity of the serving node, probed from the host at request time.
 *
 * Every field is read live from the OS — nothing here is hardcoded. On the
 * showcase's CPU-only Vultr box this reports the actual vCPU/RAM/hostname of
 * the sovereign node; the production-target GPU is surfaced separately (a real
 * GPU probe would use `nvidia-smi`, absent here by design). No external calls.
 *
 * Not marked `server-only` so the pure shape stays unit-testable; it is only
 * ever imported by server routes + the inference stamp, never a client bundle.
 */
export function getNodeInfo(): NodeInfo {
  const cpus = os.cpus();
  return {
    host: os.hostname(),
    cpu: cpus[0]?.model?.trim() || "unknown",
    cpuCount: cpus.length,
    memMb: Math.round(os.totalmem() / (1024 * 1024)),
    uptimeSeconds: Math.round(process.uptime()),
    platform: process.platform,
  };
}
