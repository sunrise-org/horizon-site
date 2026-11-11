"use client";

import { useEffect } from "react";

// One listener for the whole site: it tells the card under the pointer where the pointer is (--mx, --my), and the
// card's hover style draws a soft light there (.glass-panel in app/globals.css). Touch and pens are left alone.
export function PointerGlow() {
  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const card = (event.target as Element | null)?.closest?.<HTMLElement>(".glass-panel.soft-press");
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - box.left}px`);
      card.style.setProperty("--my", `${event.clientY - box.top}px`);
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => document.removeEventListener("pointermove", move);
  }, []);
  return null;
}
