import type { Capability, Status } from "./types";

export const STATUSES = ["Covered", "Partial", "Missing", "Not applicable"] as const satisfies readonly Status[];

export function countByStatus(capabilities: Capability[]): Record<Status, number> {
  const counts: Record<Status, number> = { Covered: 0, Partial: 0, Missing: 0, "Not applicable": 0 };
  for (const c of capabilities) counts[c.status]++;
  return counts;
}

// "3 covered · 1 partial": the statuses an area has, in the page's order.
export function countLine(capabilities: Capability[]): string {
  const counts = countByStatus(capabilities);
  return STATUSES.filter((s) => counts[s] > 0)
    .map((s) => `${counts[s]} ${s.toLowerCase()}`)
    .join(" · ");
}
