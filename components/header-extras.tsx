"use client";

import { useEffect } from "react";

const WORD = "sahur";
const COOLDOWN_MS = 10_000;
let lastRun = -Infinity;

export function startExtras(): boolean {
  const now = performance.now();
  if (document.hidden || now - lastRun < COOLDOWN_MS) return false;
  lastRun = now;
  void import("@/components/header-extras-fx").then((m) => m.run()).catch(() => {});
  return true;
}

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export function HeaderExtras() {
  useEffect(() => {
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Shift") return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.key.length !== 1 || typing(e.target)) {
        typed = "";
        return;
      }
      typed = (typed + e.key.toLowerCase()).slice(-WORD.length);
      if (typed === WORD) {
        typed = "";
        startExtras();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
