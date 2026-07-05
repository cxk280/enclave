import { getRegionById } from "./regions";

/**
 * Render an ISO (UTC) timestamp in a region's REAL local time, e.g.
 * "2026-07-05 16:41:07 GMT+2" — never the raw UTC clock mislabeled with a tz,
 * and never a bare IANA id. Every on-screen timestamp goes through this one
 * path so the "processed in-region" story shows a single, consistent clock.
 * Falls back to a clearly-labeled UTC slice if the zone/date is unusable.
 */
export function formatInRegionTime(iso: string, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    }).formatToParts(new Date(iso));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} ${get("timeZoneName")}`;
  } catch {
    return `${iso.slice(0, 10)} ${iso.slice(11, 19)} UTC`;
  }
}

/** Just the region-local clock + offset, e.g. "16:41:07 GMT+2" — for table rows. */
export function formatRegionClock(iso: string, timeZone: string): string {
  return formatInRegionTime(iso, timeZone).slice(11); // drop the "YYYY-MM-DD " prefix
}

/** Region-local clock for an audit entry, resolved from its own regionId, so a
 *  row logged in Nairobi reads in EAT and a Johannesburg row in SAST. */
export function formatEntryClock(iso: string, regionId: string): string {
  return formatRegionClock(iso, getRegionById(regionId).timezone);
}

/** Region-local calendar date ("YYYY-MM-DD") for an audit entry — kept in the
 *  SAME zone as its clock so a near-midnight event doesn't show a UTC date next
 *  to a local time (which would disagree with the result page by a day). */
export function formatEntryDate(iso: string, regionId: string): string {
  return formatInRegionTime(iso, getRegionById(regionId).timezone).slice(0, 10);
}
