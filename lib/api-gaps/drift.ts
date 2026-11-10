import type { Capability, RefState } from "./types";

export type Drift = {
  // Source paths that are no longer on main.
  missing: string[];
  // Linked issues and pull requests whose state is no longer the one the row was reviewed with.
  changed: RefState[];
};

export function driftOf(capability: Capability, missing: ReadonlySet<string>, live: ReadonlyMap<number, RefState>): Drift {
  return {
    missing: capability.sources.filter((p) => missing.has(p)),
    changed: capability.refs.flatMap((ref) => {
      const now = live.get(ref.number);
      return now && now.state !== ref.state ? [now] : [];
    }),
  };
}

export const drifted = (d: Drift) => d.missing.length > 0 || d.changed.length > 0;
