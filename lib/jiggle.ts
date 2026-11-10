export const DURATION_MS = 900;
export const SUN_DELAY_MS = 0;
export const MIDDLE_RAY_DELAY_MS = 110;
export const SIDE_RAY_DELAY_MS = 170;
export const MAX_ENERGY = 1.6;
export const HOVER_ENERGY = 0.8;
const HALF_LIFE_MS = 600;
const SQUASH = 0.24;
const FLICK_CELLS = 2.6;
const STEPS = 40;

export function nextEnergy(energy: number, sinceLastMs: number): number {
  return Math.min(MAX_ENERGY, energy * 0.5 ** (sinceLastMs / HALF_LIFE_MS) + 1);
}

function spring(amplitude: number, damping: number, cycles: number, wave: (x: number) => number, css: (d: number) => string): Keyframe[] {
  return Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    return { transform: i === STEPS ? "none" : css(amplitude * Math.exp(-damping * t) * wave(t * Math.PI * cycles)) };
  });
}

// The sun squashes on its base: scaleY drops by d while scaleX grows by 1 / (1 - d).
export function sunFrames(energy: number): Keyframe[] {
  return spring(SQUASH * energy, 5, 7, Math.cos, (d) => `scale(${(1 / (1 - d)).toFixed(4)}, ${(1 - d).toFixed(4)})`);
}

// Rays flick up by `d` cells (user units of the 16-cell mark) and settle.
export function rayFrames(energy: number): Keyframe[] {
  return spring(FLICK_CELLS * energy, 4.5, 6, Math.sin, (d) => `translate(0, ${(-d).toFixed(3)}px)`);
}
