/**
 * Deterministic SHA-256 stamp for the residency/audit trail. Uses Web Crypto
 * (available in the Node and Edge runtimes) so the same input always yields the
 * same hash — the stamp is evidence, not a secret.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Compact a full hex digest for table display: "9f2a1c…c71b". */
export function shortHash(hex: string): string {
  const clean = hex.replace(/^sha256:/, "");
  return `${clean.slice(0, 6)}…${clean.slice(-4)}`;
}
