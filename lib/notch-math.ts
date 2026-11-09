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
 * Automatically adapts shoulder and corner radii so both sides are always 100% symmetrical.
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
  const R = orbRadius + gap; // 31.5 by default
  const clampedCenterX = Math.max(R + 6, Math.min(safeWidth - R - 6, centerX));
  const distLeft = clampedCenterX;
  const distRight = safeWidth - clampedCenterX;
  const minDistToEdge = Math.min(distLeft, distRight);

  // Both shoulders MUST have the exact same radius sR so the circular cavity is never tilted or lopsided
  const desiredCorner = Math.min(cornerRadius, 18);
  const availableForShoulder = Math.max(R + 1.5, minDistToEdge - desiredCorner * 0.55);
  const maxAllowedSR = Math.max(4.0, (availableForShoulder * availableForShoulder - R * R) / (2 * R));
  const sR = Math.min(shoulderRadius, maxAllowedSR);

  const sinAlpha = sR / (R + sR);
  const cosAlpha = Math.sqrt(Math.max(0, 1 - sinAlpha * sinAlpha));

  const dxShoulder = (R + sR) * cosAlpha;
  const dxArc = R * cosAlpha;
  const yArc = topY + R * sinAlpha;

  const xLeftStart = Math.max(0, clampedCenterX - dxShoulder);
  const xRightEnd = Math.min(safeWidth, clampedCenterX + dxShoulder);
  const xLeftArc = clampedCenterX - dxArc;
  const xRightArc = clampedCenterX + dxArc;

  // Outer corners: must not collide with the notch shoulders
  const maxCornerPossible = Math.max(4, Math.min(xLeftStart, safeWidth - xRightEnd));
  const cR = Math.min(cornerRadius, maxCornerPossible);

  const bR = Math.max(0, Math.min(bottomCornerRadius, 32));

  if (bR > 0) {
    return [
      `M ${cR.toFixed(2)} ${topY}`,
      `H ${xLeftStart.toFixed(2)}`,
      `A ${sR.toFixed(2)} ${sR.toFixed(2)} 0 0 1 ${xLeftArc.toFixed(2)} ${yArc.toFixed(2)}`,
      `A ${R.toFixed(2)} ${R.toFixed(2)} 0 0 0 ${xRightArc.toFixed(2)} ${yArc.toFixed(2)}`,
      `A ${sR.toFixed(2)} ${sR.toFixed(2)} 0 0 1 ${xRightEnd.toFixed(2)} ${topY}`,
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
    `H ${xLeftStart.toFixed(2)}`,
    `A ${sR.toFixed(2)} ${sR.toFixed(2)} 0 0 1 ${xLeftArc.toFixed(2)} ${yArc.toFixed(2)}`,
    `A ${R.toFixed(2)} ${R.toFixed(2)} 0 0 0 ${xRightArc.toFixed(2)} ${yArc.toFixed(2)}`,
    `A ${sR.toFixed(2)} ${sR.toFixed(2)} 0 0 1 ${xRightEnd.toFixed(2)} ${topY}`,
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
 * Uses a gentle, fluid hop envelope (max 4.5px) that keeps the orb comfortably cradled inside the notch.
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
  // Gentle, fluid hop that preserves the notch cradle and never lifts the orb out into the content area
  const hopHeight = Math.min(4.5, absDelta * 0.035);
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
