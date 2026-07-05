import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResidencyPanel } from "./residency-panel";
import type { ResidencyStamp } from "@/lib/types";

const stamp: ResidencyStamp = {
  regionId: "af-south-1",
  regionCity: "Johannesburg",
  regionCountry: "South Africa",
  gpu: "NVIDIA L40S",
  node: {
    host: "enclave-jnb",
    cpu: "AMD EPYC",
    cpuCount: 1,
    memMb: 1024,
    uptimeSeconds: 128,
    platform: "linux",
  },
  operator: "National staff · in-country",
  egress: "none",
  externalCalls: 0,
  egressProof: { externalConnections: 0, measuredVia: "/proc/net/tcp", live: true },
  latencyMs: 7,
  auditHash: `sha256:${"a".repeat(64)}`,
  timestamp: "2026-07-04T12:41:07Z",
  timezone: "Africa/Johannesburg",
};

describe("ResidencyPanel", () => {
  it("surfaces the sovereignty guarantee", () => {
    render(<ResidencyPanel residency={stamp} />);
    expect(screen.getByText("Processed in Johannesburg")).toBeInTheDocument();
    expect(screen.getByText(/Data never left South Africa/)).toBeInTheDocument();
    expect(screen.getAllByText(/Egress: none/i).length).toBeGreaterThan(0);
    // the zero-external-calls counter
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText(/af-south-1 · NVIDIA L40S/)).toBeInTheDocument();
  });

  it("shows the real serving node, measured latency, and kernel egress proof", () => {
    render(<ResidencyPanel residency={stamp} />);
    expect(screen.getByText(/enclave-jnb · 1 vCPU/)).toBeInTheDocument();
    expect(screen.getByText(/7 ms · measured in-region/)).toBeInTheDocument();
    expect(screen.getByText(/Kernel-confirmed: 0 external TCP connections/)).toBeInTheDocument();
  });

  it("renders the timestamp in the region's real local time, not raw UTC", () => {
    render(<ResidencyPanel residency={stamp} />);
    // 12:41:07 UTC in Africa/Johannesburg (UTC+2) is 14:41:07 local.
    expect(screen.getByText(/14:41:07/)).toBeInTheDocument();
    // The raw IANA zone id must not leak into the UI.
    expect(screen.queryByText(/Africa\/Johannesburg/)).not.toBeInTheDocument();
  });
});
