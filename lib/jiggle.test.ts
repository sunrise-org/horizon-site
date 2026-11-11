import assert from "node:assert/strict";
import { test } from "node:test";
import { HOVER_ENERGY, MAX_ENERGY, MIDDLE_RAY_DELAY_MS, SIDE_RAY_DELAY_MS, nextEnergy, rayFrames, sunFrames } from "./jiggle.ts";

const scales = (frame: Keyframe) => /scale\(([^,]+), ([^)]+)\)/.exec(String(frame.transform))?.slice(1).map(Number) ?? [1, 1];
const lift = (frame: Keyframe) => -Number(/translate\(0, ([^p]+)px\)/.exec(String(frame.transform))?.[1] ?? 0);
const sunPeak = (energy: number) => Math.max(...sunFrames(energy).map((f) => 1 - scales(f)[1]));
const rayPeak = (energy: number) => Math.max(...rayFrames(energy).map(lift));

test("the sun starts squashed and wide, and settles at rest", () => {
  const [first] = sunFrames(1);
  const [x, y] = scales(first);
  assert.ok(y < 1 && x > 1);
  assert.equal(sunFrames(1).at(-1)?.transform, "none");
});

test("the rays flick up from rest and settle", () => {
  const frames = rayFrames(1);
  assert.ok(lift(frames[0]) === 0);
  assert.ok(rayPeak(1) > 1);
  assert.equal(frames.at(-1)?.transform, "none");
});

test("the middle ray follows the sun and the side rays follow the middle", () => {
  assert.ok(0 < MIDDLE_RAY_DELAY_MS && MIDDLE_RAY_DELAY_MS < SIDE_RAY_DELAY_MS);
});

test("more energy moves every part harder", () => {
  assert.ok(sunPeak(1) > sunPeak(HOVER_ENERGY) && rayPeak(1) > rayPeak(HOVER_ENERGY));
  assert.ok(sunPeak(MAX_ENERGY) > sunPeak(1) && rayPeak(MAX_ENERGY) > rayPeak(1));
});

test("rapid clicks add energy up to the cap, and it fades while idle", () => {
  let energy = 0;
  for (let i = 0; i < 10; i++) energy = nextEnergy(energy, 100);
  assert.equal(energy, MAX_ENERGY);
  assert.equal(nextEnergy(1, 600), 1.5);
  assert.ok(nextEnergy(1, 10_000) < 1.01);
});
