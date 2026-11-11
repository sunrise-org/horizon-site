"use client";

import { useEffect, useState } from "react";

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

function relative(from: number, now: number): string {
  const seconds = Math.round((from - now) / 1000);
  if (Math.abs(seconds) < 45) return "just now";
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  return format.format(seconds, "second");
}

// The server renders the exact time; the browser swaps it for "x minutes ago" and keeps it current.
export function Synced({ iso }: { iso: string }) {
  const at = Date.parse(iso);
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setLabel(relative(at, Date.now()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [at]);
  const exact = new Date(at).toISOString().slice(0, 16).replace("T", " ");
  return <time dateTime={iso} title={`${exact} UTC`}>{label ?? `${exact} UTC`}</time>;
}
