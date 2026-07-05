import { readFileSync } from "node:fs";
import type { EgressProof } from "./types";

/**
 * Real, kernel-measured egress proof.
 *
 * Instead of *asserting* "0 external calls", this reads the process network
 * namespace's open TCP sockets from Linux `/proc/net/tcp[6]` and counts
 * ESTABLISHED **outbound** connections to non-loopback hosts. Inside the
 * container's own netns, that set is exactly the app's own sockets — the host's
 * sshd et al. live in a different namespace and never appear — so the number is
 * a truthful measure of what the app dials out to. In-region, it is 0.
 *
 * Degrades gracefully where /proc is absent (e.g. local macOS dev): returns a
 * clearly-flagged static fallback (`live: false`) rather than a fake number.
 *
 * The parser is exported and pure so it can be unit-tested against fixtures.
 */

const ESTABLISHED = "01";

/** Is a hex-encoded /proc address the loopback / unspecified address? */
function isLoopbackOrLocal(hexAddr: string): boolean {
  // IPv4: 8 hex chars, little-endian (e.g. "0100007F" == 127.0.0.1).
  if (hexAddr.length === 8) {
    if (hexAddr === "00000000") return true; // 0.0.0.0
    const firstOctet = parseInt(hexAddr.slice(6, 8), 16); // little-endian
    return firstOctet === 127; // 127.0.0.0/8
  }
  // IPv6: 32 hex chars. Treat ::, ::1, and v4-mapped loopback as local.
  if (hexAddr.length === 32) {
    if (/^0+$/.test(hexAddr)) return true; // ::
    if (hexAddr === "00000000000000000000000001000000") return true; // ::1
    // v4-mapped (::ffff:127.0.0.0/8). /proc prints each 32-bit word little-endian,
    // so ::ffff:127.0.0.1 renders as "0000000000000000FFFF00000100007F": the
    // "ffff" word is byte-swapped to "FFFF0000", and the v4 octet sits in the
    // last word's final byte.
    if (hexAddr.slice(0, 24) === "0000000000000000FFFF0000") {
      return parseInt(hexAddr.slice(30, 32), 16) === 127;
    }
    return false;
  }
  return false;
}

/**
 * Count ESTABLISHED outbound connections to non-loopback remotes in one
 * `/proc/net/tcp` (or tcp6) table. Rows whose *local* port is the app's listen
 * port are inbound clients (traffic to us), not egress, and are excluded.
 */
export function countExternalConnections(procContents: string, listenPort: number): number {
  const lines = procContents.trim().split("\n").slice(1); // drop the header row
  let count = 0;
  for (const line of lines) {
    const cols = line.trim().split(/\s+/);
    if (cols.length < 4) continue;
    const localPortHex = cols[1].split(":")[1];
    const remAddr = cols[2].split(":")[0];
    const st = cols[3];
    if (st !== ESTABLISHED) continue;
    if (!localPortHex || !remAddr) continue; // malformed row — skip, don't miscount
    if (parseInt(localPortHex, 16) === listenPort) continue; // inbound client
    if (isLoopbackOrLocal(remAddr)) continue; // loopback / in-process
    count++;
  }
  return count;
}

/** Read a real egress measurement from the kernel, or a flagged fallback. */
export function readEgressProof(): EgressProof {
  const parsedPort = Number(process.env.PORT);
  const listenPort = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3000;
  try {
    let count = countExternalConnections(readFileSync("/proc/net/tcp", "utf8"), listenPort);
    try {
      count += countExternalConnections(readFileSync("/proc/net/tcp6", "utf8"), listenPort);
    } catch {
      // tcp6 may not exist; the v4 count still stands.
    }
    return { externalConnections: count, measuredVia: "/proc/net/tcp", live: true };
  } catch {
    // No /proc (macOS/dev): fall back to the app-level static guarantee, flagged.
    return { externalConnections: 0, measuredVia: "static", live: false };
  }
}
