"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { HorizonMark } from "@/components/icons";
import { DURATION_MS, HOVER_ENERGY, nextEnergy, springFrames } from "@/lib/jiggle";

export function LogoLink({ href, children }: { href: string; children: ReactNode }) {
  const mark = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation | null>(null);
  const energy = useRef(0);
  const lastClick = useRef(-Infinity);

  useEffect(() => () => animation.current?.cancel(), []);

  const jiggle = (strength: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animation.current?.cancel();
    animation.current = mark.current?.animate(springFrames(strength), { duration: DURATION_MS, easing: "linear" }) ?? null;
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-white"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse" && animation.current?.playState !== "running") jiggle(HOVER_ENERGY);
      }}
      onClick={() => {
        const now = performance.now();
        energy.current = nextEnergy(energy.current, now - lastClick.current);
        lastClick.current = now;
        jiggle(energy.current);
      }}
    >
      <span ref={mark} className="inline-flex origin-bottom">
        <HorizonMark className="size-8" />
      </span>
      {children}
    </Link>
  );
}
