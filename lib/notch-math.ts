export interface NotchGeometryParams {
  width?: number;
  height?: number;
  topY?: number;
  centerX?: number;
  orbRadius?: number;
  gap?: number;
  shoulderRadius?: number;
  cornerRadius?: number;
  bottomCornerRadius?: number;
}

export interface FlatPanelParams {
  width?: number;
  height?: number;
  topY?: number;
  cornerRadius?: number;
  bottomCornerRadius?: number;
}

export interface FramePhysicsState {
  x: number;
  arcY: number;
  scaleX: number;
  scaleY: number;
  iconOpacity: number;
  iconScale: number;
  shouldSwitchIcon: boolean;
}

/**
 * Dynamically generates a symmetrical, pinch-free SVG notch path.
 * Automatically compresses shoulder and corner radii when the orb approaches panel edges.
 */
export function buildSymmetricalNotch({
  width = 332,
  height = 90,
  topY = 22,
  centerX = 127.5,
  orbRadius = 23,
  gap = 8.5,
  shoulderRadius = 13,
  cornerRadius = 24,
  bottomCornerRadius = 0,
}: NotchGeometryParams = {}): string {
  const safeWidth = Math.max(120, width);
  const R = orbRadius + gap;
  const clampedCenterX = Math.max(R + 4, Math.min(safeWidth - R - 4, centerX));
  const distLeft = clampedCenterX;
  const distRight = safeWidth - clampedCenterX;

  function calcSide(distToEdge: number) {
    const safeDist = Math.max(R + 2, distToEdge);
    // Reserve space for outer corner rounding when possible so the outer shoulder doesn't swallow the corner
    const desiredCornerReserve = Math.min(cornerRadius * 0.55, Math.max(0, safeDist - R - 2));
    const effectiveDist = Math.max(R + 1.5, safeDist - desiredCornerReserve);
    const maxAllowedSR = Math.max(1.5, (effectiveDist * effectiveDist - R * R) / (2 * R));
    const sR = Math.min(shoulderRadius, maxAllowedSR);

    const sinAlpha = sR / (R + sR);
    const cosAlpha = Math.sqrt(Math.max(0, 1 - sinAlpha * sinAlpha));

    const dxStart = Math.min(distToEdge - 1, (R + sR) * cosAlpha);
    const dxArc = R * cosAlpha;
    const yArc = topY + R * sinAlpha;

    const remainingSpace = Math.max(0, distToEdge - dxStart);
    const cR = Math.min(cornerRadius, remainingSpace);

    return { sR, dxStart, dxArc, yArc, cR };
  }

  const left = calcSide(distLeft);
  const right = calcSide(distRight);

  const xLeftStart = Math.max(left.cR, clampedCenterX - left.dxStart);
  const xLeftArc = clampedCenterX - left.dxArc;
  const xRightArc = clampedCenterX + right.dxArc;
  const xRightEnd = Math.min(safeWidth - right.cR, clampedCenterX + right.dxStart);

  const bR = Math.max(0, Math.min(bottomCornerRadius, 32));

  if (bR > 0) {
    return [
      `M ${left.cR.toFixed(2)} ${topY}`,
      `H ${xLeftStart.toFixed(2)}`,
      `A ${left.sR.toFixed(2)} ${left.sR.toFixed(2)} 0 0 1 ${xLeftArc.toFixed(2)} ${left.yArc.toFixed(2)}`,
      `A ${R.toFixed(2)} ${R.toFixed(2)} 0 0 0 ${xRightArc.toFixed(2)} ${right.yArc.toFixed(2)}`,
      `A ${right.sR.toFixed(2)} ${right.sR.toFixed(2)} 0 0 1 ${xRightEnd.toFixed(2)} ${topY}`,
      `H ${(safeWidth - right.cR).toFixed(2)}`,
      `A ${right.cR.toFixed(2)} ${right.cR.toFixed(2)} 0 0 1 ${safeWidth.toFixed(2)} ${(topY + right.cR).toFixed(2)}`,
      `V ${(height - bR).toFixed(2)}`,
      `A ${bR.toFixed(2)} ${bR.toFixed(2)} 0 0 1 ${(safeWidth - bR).toFixed(2)} ${height}`,
      `H ${bR.toFixed(2)}`,
      `A ${bR.toFixed(2)} ${bR.toFixed(2)} 0 0 1 0 ${(height - bR).toFixed(2)}`,
      `V ${(topY + left.cR).toFixed(2)}`,
      `A ${left.cR.toFixed(2)} ${left.cR.toFixed(2)} 0 0 1 ${left.cR.toFixed(2)} ${topY}`,
      `Z`,
    ].join(' ');
  }

  return [
    `M ${left.cR.toFixed(2)} ${topY}`,
    `H ${xLeftStart.toFixed(2)}`,
    `A ${left.sR.toFixed(2)} ${left.sR.toFixed(2)} 0 0 1 ${xLeftArc.toFixed(2)} ${left.yArc.toFixed(2)}`,
    `A ${R.toFixed(2)} ${R.toFixed(2)} 0 0 0 ${xRightArc.toFixed(2)} ${right.yArc.toFixed(2)}`,
    `A ${right.sR.toFixed(2)} ${right.sR.toFixed(2)} 0 0 1 ${xRightEnd.toFixed(2)} ${topY}`,
    `H ${(safeWidth - right.cR).toFixed(2)}`,
    `A ${right.cR.toFixed(2)} ${right.cR.toFixed(2)} 0 0 1 ${safeWidth.toFixed(2)} ${(topY + right.cR).toFixed(2)}`,
    `V ${height}`,
    `H 0`,
    `V ${(topY + left.cR).toFixed(2)}`,
    `A ${left.cR.toFixed(2)} ${left.cR.toFixed(2)} 0 0 1 ${left.cR.toFixed(2)} ${topY}`,
    `Z`,
  ].join(' ');
}

/**
 * Generates a flat glassmorphic panel path (used in 'pill' slider mode).
 */
export function buildFlatPanel({
  width = 332,
  height = 90,
  topY = 22,
  cornerRadius = 24,
  bottomCornerRadius = 0,
}: FlatPanelParams = {}): string {
  const safeWidth = Math.max(120, width);
  const cR = Math.min(cornerRadius, safeWidth / 4);
  const bR = Math.max(0, Math.min(bottomCornerRadius, 32));

  if (bR > 0) {
    return [
      `M ${cR.toFixed(2)} ${topY}`,
      `H ${(safeWidth - cR).toFixed(2)}`,
      `A ${cR.toFixed(2)} ${cR.toFixed(2)} 0 0 1 ${safeWidth.toFixed(2)} ${(topY + cR).toFixed(2)}`,
      `V ${(height - bR).toFixed(2)}`,
      `A ${bR.toFixed(2)} ${bR.toFixed(2)} 0 0 1 ${(safeWidth - bR).toFixed(2)} ${height}`,
      `H ${bR.toFixed(2)}`,
      `A ${bR.toFixed(2)} ${bR.toFixed(2)} 0 0 1 0 ${(height - bR).toFixed(2)}`,
      `V ${(topY + cR).toFixed(2)}`,
      `A ${cR.toFixed(2)} ${cR.toFixed(2)} 0 0 1 ${cR.toFixed(2)} ${topY}`,
      `Z`,
    ].join(' ');
  }

  return [
    `M ${cR.toFixed(2)} ${topY}`,
    `H ${(safeWidth - cR).toFixed(2)}`,
    `A ${cR.toFixed(2)} ${cR.toFixed(2)} 0 0 1 ${safeWidth.toFixed(2)} ${(topY + cR).toFixed(2)}`,
    `V ${height}`,
    `H 0`,
    `V ${(topY + cR).toFixed(2)}`,
    `A ${cR.toFixed(2)} ${cR.toFixed(2)} 0 0 1 ${cR.toFixed(2)} ${topY}`,
    `Z`,
  ].join(' ');
}

/**
 * Calculates the horizontal center X coordinate for a given tab index.
 */
export function getTabCenterX(
  tabIndex: number,
  width: number = 332,
  totalTabs: number = 4
): number {
  const padX = 12;
  const innerW = Math.max(100, width - padX * 2);
  const count = Math.max(1, totalTabs);
  const clampedIdx = Math.max(0, Math.min(count - 1, tabIndex));
  const colW = innerW / count;
  return padX + colW * clampedIdx + colW / 2;
}

/**
 * Non-linear physical velocity curve with magnetic micro-overshoot.
 * Note: Returns continuous values where t=0 -> 0 and t=1 -> 1.
 */
export function calculateDynamicEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const base = 1 - Math.pow(1 - t, 3.4);
  const microOvershoot = Math.sin(t * Math.PI) * Math.pow(t, 2) * 0.038;
  return base + microOvershoot;
}

/**
 * Calculates adaptive transit duration in milliseconds based on travel distance and speed multiplier.
 * Fixed bug: Speed multipliers < 1 (Slow-Mo, e.g., 0.25x) now properly extend duration beyond 480ms.
 */
export function calculateTransitDuration(
  deltaX: number,
  speedMultiplier: number = 1.0
): number {
  const baseDuration = 300;
  const rawIntrinsic = baseDuration + Math.sqrt(Math.abs(deltaX)) * 7.8;
  const clampedIntrinsic = Math.min(480, Math.max(300, rawIntrinsic));
  const safeMult = Math.max(0.15, Math.min(3.0, speedMultiplier));
  return clampedIntrinsic / safeMult;
}

/**
 * Pure frame physics evaluator for t in [0, 1].
 * FIXED BUG: Replaced the abrupt discontinuity at t=0.88 with a continuous C1-smooth blend
 * between flight stretch and landing elastic cushion so the orb never snaps mid-air.
 */
export function computeFramePhysics(
  t: number,
  startX: number,
  deltaX: number
): FramePhysicsState {
  const clampedT = Math.max(0, Math.min(1, t));
  const ease = calculateDynamicEase(clampedT);
  const x = startX + deltaX * ease;

  const absDelta = Math.abs(deltaX);
  const hopHeight = Math.min(13, absDelta * 0.082);
  const arcProgress = Math.sin(Math.pow(clampedT, 0.72) * Math.PI);
  const arcY = arcProgress * hopHeight;

  // Flight elongation envelope (peaks around t=0.45, tapers smoothly to 0 by t=0.86)
  const stretchWindow = clampedT < 0.86 ? Math.sin((clampedT / 0.86) * Math.PI) : 0;
  const maxStretch = Math.min(0.18, (absDelta / 320) * 0.22);
  const flightStretch = maxStretch * stretchWindow;

  // Landing cushion envelope (starts smoothly at t=0.82, peaks at t=0.91, settles to 0 at t=1.0)
  const squashWindow =
    clampedT > 0.82 ? Math.sin(((clampedT - 0.82) / 0.18) * Math.PI) : 0;
  const landingSquash = squashWindow * 0.048;

  const netHorizontalDeform = flightStretch - landingSquash;
  const scaleX = 1 + netHorizontalDeform;
  const scaleY = 1 - flightStretch * 0.65 + landingSquash * 0.85;

  // Icon fade-out / switch / fade-in phases
  let iconOpacity = 1;
  let iconScale = 1;
  let shouldSwitchIcon = false;

  if (clampedT < 0.22) {
    const p = clampedT / 0.22;
    iconOpacity = Math.max(0, 1 - p * 1.15);
    iconScale = 1 - 0.18 * p;
  } else if (clampedT < 0.66) {
    iconOpacity = 0;
    iconScale = 0.82;
    shouldSwitchIcon = true;
  } else {
    shouldSwitchIcon = true;
    const p = (clampedT - 0.66) / 0.34;
    // Smooth cubic ease-out for icon appearance
    const easeInIcon = 1 - Math.pow(1 - p, 2.5);
    iconOpacity = Math.min(1, easeInIcon);
    iconScale = 0.82 + 0.18 * easeInIcon;
  }

  return {
    x,
    arcY,
    scaleX,
    scaleY,
    iconOpacity,
    iconScale,
    shouldSwitchIcon,
  };
}
