export const DURATION_MS = 500;
export const MAX_ENERGY = 3;
export const HOVER_ENERGY = 0.8;
const HALF_LIFE_MS = 600;
const AMPLITUDE = 0.09;
const DAMPING = 7;
const CYCLES_PER_SECOND = 3.2;
const STEPS = 25;

export function nextEnergy(energy: number, sinceLastMs: number): number {
  return Math.min(MAX_ENERGY, energy * 0.5 ** (sinceLastMs / HALF_LIFE_MS) + 1);
}

export function springFrames(energy: number): Keyframe[] {
  return Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = (i / STEPS) * (DURATION_MS / 1000);
    const s = i === STEPS ? 0 : -AMPLITUDE * energy * Math.exp(-DAMPING * t) * Math.cos(2 * Math.PI * CYCLES_PER_SECOND * t);
    return { transform: `scale(${(1 - s * 0.7).toFixed(4)}, ${(1 + s).toFixed(4)})` };
  });
}
