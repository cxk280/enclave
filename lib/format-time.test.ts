import { describe, expect, it } from "vitest";
import {
  formatEntryClock,
  formatEntryDate,
  formatInRegionTime,
  formatRegionClock,
} from "./format-time";

// 12:41:07 UTC — offset applied per zone, independent of the machine's own tz.
const ISO = "2026-07-04T12:41:07Z";

describe("region-local time formatting", () => {
  it("converts UTC to Johannesburg local time (+2) with an offset label", () => {
    const s = formatInRegionTime(ISO, "Africa/Johannesburg");
    expect(s).toContain("14:41:07");
    expect(s).toContain("GMT+2");
    expect(s).not.toContain("Africa/Johannesburg"); // never leak the raw IANA id
  });

  it("converts UTC to Nairobi local time (+3), a different zone than SA", () => {
    const s = formatInRegionTime(ISO, "Africa/Nairobi");
    expect(s).toContain("15:41:07");
    expect(s).toContain("GMT+3");
  });

  it("formatRegionClock drops the date but keeps clock + offset", () => {
    expect(formatRegionClock(ISO, "Africa/Johannesburg")).toBe("14:41:07 GMT+2");
  });

  it("resolves an audit entry's zone from its regionId", () => {
    expect(formatEntryClock(ISO, "af-east-1")).toBe("15:41:07 GMT+3"); // Nairobi
    expect(formatEntryClock(ISO, "af-south-1")).toBe("14:41:07 GMT+2"); // Johannesburg
  });

  it("keeps an audit row's date in the SAME zone as its clock across a UTC-midnight rollover", () => {
    // 22:30 UTC is already the next calendar day in EAT (+3) and SAST (+2).
    const late = "2026-07-05T22:30:00Z";
    expect(formatEntryClock(late, "af-east-1")).toBe("01:30:00 GMT+3"); // Nairobi
    expect(formatEntryDate(late, "af-east-1")).toBe("2026-07-06"); // local date, not the UTC 07-05
    expect(formatEntryDate(late, "af-south-1")).toBe("2026-07-06"); // Johannesburg +2
  });

  it("falls back to a clearly-labeled UTC slice on an invalid zone", () => {
    const s = formatInRegionTime(ISO, "Not/AZone");
    expect(s).toContain("UTC");
    expect(s).toContain("12:41:07");
  });
});
