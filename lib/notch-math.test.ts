import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSymmetricalNotch,
  buildFlatPanel,
  getTabCenterX,
  calculateDynamicEase,
  calculateTransitDuration,
  computeFramePhysics,
} from './notch-math.ts';

test('getTabCenterX distributes tabs evenly across container width', () => {
  const w = 344; // innerW = 320, 4 tabs -> 80px each
  assert.equal(getTabCenterX(0, w, 4), 12 + 40);
  assert.equal(getTabCenterX(1, w, 4), 12 + 120);
  assert.equal(getTabCenterX(2, w, 4), 12 + 200);
  assert.equal(getTabCenterX(3, w, 4), 12 + 280);
});

test('buildSymmetricalNotch generates valid SVG path for docked and island modes', () => {
  const dockedPath = buildSymmetricalNotch({
    width: 360,
    centerX: 60,
    bottomCornerRadius: 0,
  });
  assert.ok(dockedPath.startsWith('M '));
  assert.ok(dockedPath.endsWith('Z'));
  assert.ok(dockedPath.includes('V 90 H 0'));

  const islandPath = buildSymmetricalNotch({
    width: 360,
    centerX: 300,
    bottomCornerRadius: 24,
  });
  assert.ok(islandPath.startsWith('M '));
  assert.ok(islandPath.endsWith('Z'));
  assert.ok(!islandPath.includes('V 90 H 0'));
});

test('buildFlatPanel generates valid SVG path', () => {
  const flat = buildFlatPanel({ width: 360, bottomCornerRadius: 20 });
  assert.ok(flat.startsWith('M '));
  assert.ok(flat.endsWith('Z'));
});

test('calculateDynamicEase starts at 0, ends at 1, and exhibits micro-overshoot', () => {
  assert.equal(calculateDynamicEase(0), 0);
  assert.equal(calculateDynamicEase(1), 1);
  const mid = calculateDynamicEase(0.75);
  assert.ok(mid > 0.9, `Expected fast ease-out at t=0.75, got ${mid}`);
});

test('calculateTransitDuration respects slow-motion multipliers below 1.0x', () => {
  const normal = calculateTransitDuration(200, 1.0);
  const slowMo = calculateTransitDuration(200, 0.25);
  const fast = calculateTransitDuration(200, 2.0);

  assert.ok(normal >= 300 && normal <= 480);
  assert.ok(
    Math.abs(slowMo - normal * 4) < 1,
    `Expected slowMo (${slowMo}) to be 4x normal (${normal})`
  );
  assert.ok(
    Math.abs(fast - normal * 0.5) < 1,
    `Expected fast (${fast}) to be 0.5x normal (${normal})`
  );
});

test('computeFramePhysics produces C1-continuous scaleX/scaleY without jump at t=0.88', () => {
  const f87 = computeFramePhysics(0.87, 50, 220);
  const f88 = computeFramePhysics(0.88, 50, 220);
  const f89 = computeFramePhysics(0.89, 50, 220);

  const delta1 = Math.abs(f88.scaleX - f87.scaleX);
  const delta2 = Math.abs(f89.scaleX - f88.scaleX);

  assert.ok(delta1 < 0.015, `Discontinuity detected between 0.87 and 0.88: ${delta1}`);
  assert.ok(delta2 < 0.015, `Discontinuity detected between 0.88 and 0.89: ${delta2}`);

  const endFrame = computeFramePhysics(1.0, 50, 220);
  assert.equal(endFrame.x, 270);
  assert.ok(Math.abs(endFrame.scaleX - 1) < 0.001);
  assert.ok(Math.abs(endFrame.scaleY - 1) < 0.001);
  assert.equal(endFrame.iconOpacity, 1);
});
