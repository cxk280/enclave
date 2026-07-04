import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResidencyPanel } from "./residency-panel";
import type { ResidencyStamp } from "@/lib/types";

const stamp: ResidencyStamp = {
  regionId: "af-south-1",
  regionCity: "Johannesburg",
  regionCountry: "South Africa",
  gpu: "NVIDIA L40S",
  operator: "National staff · in-country",
  egress: "none",
  externalCalls: 0,
  auditHash: `sha256:${"a".repeat(64)}`,
  timestamp: "2026-07-04T12:41:07",
  timezone: "SAST",
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
});
