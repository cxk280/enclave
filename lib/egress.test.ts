import { describe, expect, it } from "vitest";
import { countExternalConnections, readEgressProof } from "./egress";

// Minimal /proc/net/tcp fixtures (only the first four columns matter to the
// parser). Ports: listen 3000 = 0x0BB8, ephemeral = 0xC1B2, 443 = 0x01BB.
const HEADER =
  "  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode";

const rows = [
  HEADER,
  "   0: 00000000:0BB8 00000000:0000 0A 00000000:00000000 00:00000000 00000000 0 0 1 1", // LISTEN :3000 (skip)
  "   1: 0A00000A:0BB8 0F0F0F0F:D431 01 00000000:00000000 00:00000000 00000000 0 0 2 1", // inbound client → :3000 (skip)
  "   2: 0A00000A:C1B2 08080808:01BB 01 00000000:00000000 00:00000000 00000000 0 0 3 1", // ESTABLISHED outbound → 8.8.8.8:443 (COUNT)
  "   3: 0100007F:C1B3 0100007F:1F90 01 00000000:00000000 00:00000000 00000000 0 0 4 1", // ESTABLISHED to loopback (skip)
].join("\n");

describe("egress /proc parser", () => {
  it("counts only established OUTBOUND connections to non-loopback hosts", () => {
    expect(countExternalConnections(rows, 3000)).toBe(1);
  });

  it("returns 0 when only listening / inbound / loopback sockets exist", () => {
    const noEgress = [
      HEADER,
      "   0: 00000000:0BB8 00000000:0000 0A 00000000:00000000 00:00000000 00000000 0 0 1 1",
      "   1: 0A00000A:0BB8 0F0F0F0F:D431 01 00000000:00000000 00:00000000 00000000 0 0 2 1",
      "   2: 0100007F:C1B3 0100007F:1F90 01 00000000:00000000 00:00000000 00000000 0 0 3 1",
    ].join("\n");
    expect(countExternalConnections(noEgress, 3000)).toBe(0);
  });

  it("tolerates an empty table (header only)", () => {
    expect(countExternalConnections(HEADER, 3000)).toBe(0);
  });

  it("skips malformed rows instead of miscounting them", () => {
    const malformed = [
      HEADER,
      "   0: garbage", // too few columns
      "   1: no-colon-here also-bad 01 x", // addr columns without ':'
      "   2: 0A00000A:C1B2 08080808:01BB 01 x x x 0 0 3 1", // one valid egress row
    ].join("\n");
    expect(countExternalConnections(malformed, 3000)).toBe(1);
  });

  it("honors the listen port so inbound clients aren't counted as egress", () => {
    // Same outbound row, but if the app listens on the *ephemeral* port 0xC1B2
    // that row is inbound-to-us and must be excluded.
    const row =
      "   2: 0A00000A:C1B2 08080808:01BB 01 00000000:00000000 00:00000000 00000000 0 0 3 1";
    const table = `${HEADER}\n${row}`;
    expect(countExternalConnections(table, 3000)).toBe(1); // egress
    expect(countExternalConnections(table, 0xc1b2)).toBe(0); // inbound to us
  });

  it("handles IPv6 (tcp6): excludes v4-mapped loopback, counts a global remote", () => {
    // tcp6 addresses are 32 hex chars, printed little-endian per 32-bit word.
    const tcp6 = [
      HEADER,
      // listen on :3000 — skip
      "   0: 00000000000000000000000000000000:0BB8 00000000000000000000000000000000:0000 0A x x x 0 0 1 1",
      // outbound to ::ffff:127.0.0.1 (v4-mapped loopback) — must be EXCLUDED
      "   1: 0000000000000000FFFF00000A00000A:C1B2 0000000000000000FFFF00000100007F:0050 01 x x x 0 0 2 1",
      // outbound to a global v6 address (2001:db8::1) — must be COUNTED
      "   2: 0000000000000000FFFF00000A00000A:C1B3 20010DB8000000000000000000000001:01BB 01 x x x 0 0 3 1",
    ].join("\n");
    expect(countExternalConnections(tcp6, 3000)).toBe(1);
  });

  it("readEgressProof returns a well-formed, flagged result on any platform", () => {
    const proof = readEgressProof();
    expect(proof.externalConnections).toBeGreaterThanOrEqual(0);
    expect(["/proc/net/tcp", "static"]).toContain(proof.measuredVia);
    expect(typeof proof.live).toBe("boolean");
    // live === true only when a real /proc measurement was taken.
    expect(proof.live).toBe(proof.measuredVia === "/proc/net/tcp");
  });
});
