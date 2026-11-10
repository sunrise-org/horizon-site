import assert from "node:assert/strict";
import { test } from "node:test";
import { HOVER_ENERGY, MAX_ENERGY, nextEnergy, springFrames } from "./jiggle.ts";

const scaleY = (frame: Keyframe) => Number(/scale\([^,]+, ([^)]+)\)/.exec(String(frame.transform))?.[1]);
const peak = (energy: number) => Math.max(...springFrames(energy).map((f) => Math.abs(scaleY(f) - 1)));

test("the wobble starts squashed and settles at rest", () => {
  const frames = springFrames(1);
  assert.ok(scaleY(frames[1]) < 1);
  assert.equal(frames.at(-1)?.transform, "scale(1.0000, 1.0000)");
});

test("more energy wobbles harder", () => {
  assert.ok(peak(2) > peak(1) && peak(1) > peak(HOVER_ENERGY));
});

test("rapid clicks add energy up to the cap, and it fades while idle", () => {
  let energy = 0;
  for (let i = 0; i < 10; i++) energy = nextEnergy(energy, 100);
  assert.equal(energy, MAX_ENERGY);
  assert.equal(nextEnergy(1, 600), 1.5);
  assert.ok(nextEnergy(1, 10_000) < 1.01);
});
