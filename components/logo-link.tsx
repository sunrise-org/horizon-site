"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { startExtras } from "@/components/header-extras";
import { SunriseMark } from "@/components/icons";
import {
  DURATION_MS,
  HOVER_ENERGY,
  MIDDLE_RAY_DELAY_MS,
  SIDE_RAY_DELAY_MS,
  SUN_DELAY_MS,
  nextEnergy,
  rayFrames,
  sunFrames,
} from "@/lib/jiggle";

export function LogoLink({ href, children }: { href: string; children: ReactNode }) {
  const mark = useRef<HTMLSpanElement>(null);
  const animations = useRef<Animation[]>([]);
  const energy = useRef(0);
  const lastClick = useRef(-Infinity);
  const clicks = useRef<number[]>([]);

  const cancel = () => animations.current.forEach((a) => a.cancel());
  useEffect(() => cancel, []);

  const jiggle = (strength: number) => {
    const root = mark.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancel();
    const play = (part: string, frames: Keyframe[], delay: number) =>
      Array.from(root.querySelectorAll<SVGElement>(`[data-part="${part}"]`), (el) =>
        el.animate(frames, { duration: DURATION_MS, delay, easing: "linear" }),
      );
    animations.current = [
      ...play("sun", sunFrames(strength), SUN_DELAY_MS),
      ...play("middle-ray", rayFrames(strength), MIDDLE_RAY_DELAY_MS),
      ...play("side-ray", rayFrames(strength), SIDE_RAY_DELAY_MS),
    ];
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-white"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse" && !animations.current.some((a) => a.playState === "running")) jiggle(HOVER_ENERGY);
      }}
      onClick={(e) => {
        const now = performance.now();
        energy.current = nextEnergy(energy.current, now - lastClick.current);
        lastClick.current = now;
        jiggle(energy.current);
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        clicks.current = [...clicks.current.filter((at) => now - at < 1200), now];
        if (clicks.current.length >= 3 && startExtras()) {
          clicks.current = [];
          e.preventDefault();
        }
      }}
    >
      <span ref={mark} className="inline-flex">
        <SunriseMark className="size-8" />
      </span>
      {children}
    </Link>
  );
}
