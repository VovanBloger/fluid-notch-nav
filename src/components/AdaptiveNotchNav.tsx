'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Home, Compass, PlusCircle, User, Box } from 'lucide-react';
import {
  triggerHaptic,
  triggerTabTouchHaptic,
  triggerTabLandingHaptic,
  HapticProfile,
} from '../lib/haptics';

export type NavAnimMode = 'notch' | 'pill';

export interface NavItem<T extends string = string> {
  id: T;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  badge?: string | number;
  badgeColor?: string;
}

export type NavThemePreset =
  | 'purple-neon'
  | 'cyber-emerald'
  | 'sunset-amber'
  | 'electric-cyan'
  | 'clean-light'
  | 'mono-dark';

export interface NavThemeConfig {
  // Orb (floating circle)
  orbGradient?: string;
  orbGlow?: string;
  orbGlassHighlight?: string;
  orbIconColor?: string;
  orbSize?: number;

  // Glass Panel SVG
  glassFillStart?: string;
  glassFillEnd?: string;
  glassStrokeStart?: string;
  glassStrokeEnd?: string;
  glassStrokeWidth?: number;
  backdropBlur?: string;
  backdropBg?: string;

  // Inactive & Active typography/colors
  inactiveColor?: string;
  inactiveHoverColor?: string;
  activeLabelColor?: string;
  activeLabelGlow?: string;

  // Wave ripple on touch
  waveColor?: string;
  showWave?: boolean;

  // Haptic feedback & Physics
  hapticProfile?: HapticProfile;
  speedMultiplier?: number;
}

export const THEME_PRESETS: Record<NavThemePreset, NavThemeConfig> = {
  'purple-neon': {
    orbGradient: 'radial-gradient(circle at 38% 24%, #F2DBFF 0%, #C165FF 28%, #8A2BE2 68%, #4E119A 100%)',
    orbGlow: '0 8px 24px -2px rgba(155, 55, 255, 0.78), 0 0 16px rgba(181, 69, 255, 0.55), inset 0 2.5px 5px rgba(255, 255, 255, 0.65)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.38)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,

    glassFillStart: 'rgba(33, 28, 48, 0.48)',
    glassFillEnd: 'rgba(19, 16, 30, 0.72)',
    glassStrokeStart: 'rgba(216, 180, 254, 0.35)',
    glassStrokeEnd: 'rgba(216, 180, 254, 0.18)',
    glassStrokeWidth: 1.3,
    backdropBlur: '20px',
    backdropBg: 'rgba(20, 16, 30, 0.32)',

    inactiveColor: 'rgba(255, 255, 255, 0.56)',
    inactiveHoverColor: 'rgba(255, 255, 255, 0.90)',
    activeLabelColor: 'rgba(224, 208, 255, 0.95)',
    activeLabelGlow: '0 1px 10px rgba(168, 85, 247, 0.6)',

    waveColor: '#FFFFFF',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'cyber-emerald': {
    orbGradient: 'radial-gradient(circle at 38% 24%, #D1FAE5 0%, #34D399 28%, #059669 68%, #064E3B 100%)',
    orbGlow: '0 8px 24px -2px rgba(16, 185, 129, 0.75), 0 0 16px rgba(52, 211, 153, 0.55), inset 0 2.5px 5px rgba(255, 255, 255, 0.65)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.42)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,

    glassFillStart: 'rgba(14, 34, 27, 0.52)',
    glassFillEnd: 'rgba(8, 22, 17, 0.78)',
    glassStrokeStart: 'rgba(110, 231, 183, 0.35)',
    glassStrokeEnd: 'rgba(16, 185, 129, 0.22)',
    glassStrokeWidth: 1.3,
    backdropBlur: '20px',
    backdropBg: 'rgba(10, 25, 20, 0.35)',

    inactiveColor: 'rgba(255, 255, 255, 0.58)',
    inactiveHoverColor: 'rgba(255, 255, 255, 0.92)',
    activeLabelColor: 'rgba(167, 243, 208, 0.96)',
    activeLabelGlow: '0 1px 10px rgba(16, 185, 129, 0.6)',

    waveColor: '#34D399',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'sunset-amber': {
    orbGradient: 'radial-gradient(circle at 38% 24%, #FEF3C7 0%, #F59E0B 28%, #D97706 68%, #78350F 100%)',
    orbGlow: '0 8px 24px -2px rgba(245, 158, 11, 0.75), 0 0 16px rgba(251, 191, 36, 0.55), inset 0 2.5px 5px rgba(255, 255, 255, 0.65)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.42)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,

    glassFillStart: 'rgba(38, 24, 14, 0.52)',
    glassFillEnd: 'rgba(22, 13, 8, 0.78)',
    glassStrokeStart: 'rgba(252, 211, 77, 0.35)',
    glassStrokeEnd: 'rgba(245, 158, 11, 0.22)',
    glassStrokeWidth: 1.3,
    backdropBlur: '20px',
    backdropBg: 'rgba(28, 17, 10, 0.35)',

    inactiveColor: 'rgba(255, 255, 255, 0.58)',
    inactiveHoverColor: 'rgba(255, 255, 255, 0.92)',
    activeLabelColor: 'rgba(253, 230, 138, 0.96)',
    activeLabelGlow: '0 1px 10px rgba(245, 158, 11, 0.6)',

    waveColor: '#F59E0B',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'electric-cyan': {
    orbGradient: 'radial-gradient(circle at 38% 24%, #CFFAFE 0%, #06B6D4 28%, #0284C7 68%, #0C4A6E 100%)',
    orbGlow: '0 8px 24px -2px rgba(6, 182, 212, 0.75), 0 0 16px rgba(56, 189, 248, 0.55), inset 0 2.5px 5px rgba(255, 255, 255, 0.65)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.42)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,

    glassFillStart: 'rgba(12, 26, 42, 0.52)',
    glassFillEnd: 'rgba(6, 16, 28, 0.78)',
    glassStrokeStart: 'rgba(103, 232, 249, 0.35)',
    glassStrokeEnd: 'rgba(14, 165, 233, 0.22)',
    glassStrokeWidth: 1.3,
    backdropBlur: '20px',
    backdropBg: 'rgba(8, 20, 34, 0.35)',

    inactiveColor: 'rgba(255, 255, 255, 0.58)',
    inactiveHoverColor: 'rgba(255, 255, 255, 0.92)',
    activeLabelColor: 'rgba(186, 230, 253, 0.96)',
    activeLabelGlow: '0 1px 10px rgba(14, 165, 233, 0.6)',

    waveColor: '#38BDF8',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'clean-light': {
    orbGradient: 'radial-gradient(circle at 38% 24%, #EEF2FF 0%, #6366F1 32%, #4338CA 72%, #312E81 100%)',
    orbGlow: '0 8px 22px -2px rgba(79, 70, 229, 0.45), 0 0 14px rgba(99, 102, 241, 0.35), inset 0 2.5px 5px rgba(255, 255, 255, 0.8)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.65)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,

    glassFillStart: 'rgba(255, 255, 255, 0.78)',
    glassFillEnd: 'rgba(241, 245, 249, 0.92)',
    glassStrokeStart: 'rgba(255, 255, 255, 0.95)',
    glassStrokeEnd: 'rgba(148, 163, 184, 0.40)',
    glassStrokeWidth: 1.2,
    backdropBlur: '24px',
    backdropBg: 'rgba(255, 255, 255, 0.45)',

    inactiveColor: 'rgba(51, 65, 85, 0.72)',
    inactiveHoverColor: 'rgba(15, 23, 42, 0.95)',
    activeLabelColor: '#312E81',
    activeLabelGlow: '0 1px 8px rgba(99, 102, 241, 0.25)',

    waveColor: '#6366F1',
    showWave: true,
    hapticProfile: 'crisp',
  },
  'mono-dark': {
    orbGradient: 'radial-gradient(circle at 38% 24%, #F8FAFC 0%, #64748B 28%, #1E293B 70%, #020617 100%)',
    orbGlow: '0 8px 24px -2px rgba(0, 0, 0, 0.85), 0 0 16px rgba(255, 255, 255, 0.15)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.45)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,

    glassFillStart: 'rgba(15, 23, 42, 0.62)',
    glassFillEnd: 'rgba(2, 6, 23, 0.85)',
    glassStrokeStart: 'rgba(255, 255, 255, 0.24)',
    glassStrokeEnd: 'rgba(148, 163, 184, 0.14)',
    glassStrokeWidth: 1.3,
    backdropBlur: '20px',
    backdropBg: 'rgba(10, 15, 30, 0.4)',

    inactiveColor: 'rgba(148, 163, 184, 0.65)',
    inactiveHoverColor: 'rgba(248, 250, 252, 0.95)',
    activeLabelColor: '#F8FAFC',
    activeLabelGlow: '0 1px 8px rgba(255, 255, 255, 0.35)',

    waveColor: '#FFFFFF',
    showWave: true,
    hapticProfile: 'mechanical',
  },
};

export const DEFAULT_STANDARD_TABS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'create', label: 'Create', icon: PlusCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

export interface AdaptiveNotchNavProps<T extends string = string> {
  activeTab: T;
  onSelectTab: (tab: T) => void;
  navMode?: NavAnimMode;
  items?: NavItem<T>[];
  theme?: NavThemePreset | NavThemeConfig;
  className?: string;
  style?: React.CSSProperties;
  showLabels?: boolean;
  bottomCornerRadius?: number;
  hapticProfile?: HapticProfile;
}

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
} = {}): string {
  const R = orbRadius + gap;
  const distLeft = centerX;
  const distRight = width - centerX;

  function calcSide(distToEdge: number) {
    const safeDist = Math.max(R + 2, distToEdge);
    const maxAllowedSR = Math.max(1, (safeDist * safeDist - R * R) / (2 * R));
    const sR = Math.min(shoulderRadius, maxAllowedSR);

    const sinAlpha = sR / (R + sR);
    const cosAlpha = Math.sqrt(1 - sinAlpha * sinAlpha);
    const dxStart = Math.min(distToEdge - 1, (R + sR) * cosAlpha);
    const dxArc = R * cosAlpha;
    const yArc = topY + R * sinAlpha;

    const remainingSpace = Math.max(0, distToEdge - dxStart);
    const cR = Math.min(cornerRadius, remainingSpace);

    return { sR, dxStart, dxArc, yArc, cR };
  }

  const left = calcSide(distLeft);
  const right = calcSide(distRight);

  const xLeftStart = Math.max(left.cR, centerX - left.dxStart);
  const xLeftArc = centerX - left.dxArc;
  const xRightArc = centerX + right.dxArc;
  const xRightEnd = Math.min(width - right.cR, centerX + right.dxStart);

  const bR = Math.max(0, Math.min(bottomCornerRadius, 32));

  if (bR > 0) {
    return [
      `M ${left.cR.toFixed(2)} ${topY}`,
      `H ${xLeftStart.toFixed(2)}`,
      `A ${left.sR.toFixed(2)} ${left.sR.toFixed(2)} 0 0 1 ${xLeftArc.toFixed(2)} ${left.yArc.toFixed(2)}`,
      `A ${R} ${R} 0 0 0 ${xRightArc.toFixed(2)} ${right.yArc.toFixed(2)}`,
      `A ${right.sR.toFixed(2)} ${right.sR.toFixed(2)} 0 0 1 ${xRightEnd.toFixed(2)} ${topY}`,
      `H ${(width - right.cR).toFixed(2)}`,
      `A ${right.cR.toFixed(2)} ${right.cR.toFixed(2)} 0 0 1 ${width} ${(topY + right.cR).toFixed(2)}`,
      `V ${(height - bR).toFixed(2)}`,
      `A ${bR.toFixed(2)} ${bR.toFixed(2)} 0 0 1 ${(width - bR).toFixed(2)} ${height}`,
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
    `A ${R} ${R} 0 0 0 ${xRightArc.toFixed(2)} ${right.yArc.toFixed(2)}`,
    `A ${right.sR.toFixed(2)} ${right.sR.toFixed(2)} 0 0 1 ${xRightEnd.toFixed(2)} ${topY}`,
    `H ${(width - right.cR).toFixed(2)}`,
    `A ${right.cR.toFixed(2)} ${right.cR.toFixed(2)} 0 0 1 ${width} ${(topY + right.cR).toFixed(2)}`,
    `V ${height}`,
    `H 0`,
    `V ${(topY + left.cR).toFixed(2)}`,
    `A ${left.cR.toFixed(2)} ${left.cR.toFixed(2)} 0 0 1 ${left.cR.toFixed(2)} ${topY}`,
    `Z`,
  ].join(' ');
}

export function buildFlatPanel({
  width = 332,
  height = 90,
  topY = 22,
  cornerRadius = 24,
  bottomCornerRadius = 0,
} = {}): string {
  const bR = Math.max(0, Math.min(bottomCornerRadius, 32));

  if (bR > 0) {
    return [
      `M ${cornerRadius} ${topY}`,
      `H ${width - cornerRadius}`,
      `A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${topY + cornerRadius}`,
      `V ${height - bR}`,
      `A ${bR} ${bR} 0 0 1 ${width - bR} ${height}`,
      `H ${bR}`,
      `A ${bR} ${bR} 0 0 1 0 ${height - bR}`,
      `V ${topY + cornerRadius}`,
      `A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} ${topY}`,
      `Z`,
    ].join(' ');
  }

  return [
    `M ${cornerRadius} ${topY}`,
    `H ${width - cornerRadius}`,
    `A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${topY + cornerRadius}`,
    `V ${height}`,
    `H 0`,
    `V ${topY + cornerRadius}`,
    `A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} ${topY}`,
    `Z`,
  ].join(' ');
}

export function getTabCenterX(
  tabIndex: number,
  width: number = 332,
  totalTabs: number = 4
): number {
  const padX = 12;
  const innerW = Math.max(100, width - padX * 2);
  const count = Math.max(1, totalTabs);
  const colW = innerW / count;
  return padX + colW * tabIndex + colW / 2;
}

function calculateDynamicEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const base = 1 - Math.pow(1 - t, 3.4);
  const microOvershoot = Math.sin(t * Math.PI) * Math.pow(t, 2) * 0.038;
  return base + microOvershoot;
}

export function AdaptiveNotchNav<T extends string = string>({
  activeTab,
  onSelectTab,
  navMode = 'notch',
  items,
  theme: themeProp = 'purple-neon',
  className = '',
  style,
  showLabels = true,
  bottomCornerRadius = 0,
  hapticProfile: userHapticProfile,
}: AdaptiveNotchNavProps<T>) {
  const reactId = useId().replace(/:/g, '');
  const glassGradId = `panelGlassGrad-${reactId}`;
  const strokeGradId = `panelStrokeGrad-${reactId}`;
  const clipPathId = `notchClip-${reactId}`;

  const tabs: NavItem<T>[] = (items as NavItem<T>[]) || (DEFAULT_STANDARD_TABS as unknown as NavItem<T>[]);

  const activeTheme: NavThemeConfig = useMemo(() => {
    if (typeof themeProp === 'string') {
      return THEME_PRESETS[themeProp] || THEME_PRESETS['purple-neon'];
    }
    return { ...THEME_PRESETS['purple-neon'], ...themeProp };
  }, [themeProp]);

  const effectiveHapticProfile: HapticProfile =
    userHapticProfile || activeTheme.hapticProfile || 'mechanical';

  const activeIndex = useMemo(() => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    return idx >= 0 ? idx : 0;
  }, [activeTab, tabs]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [navWidth, setNavWidth] = useState<number>(332);

  const panelPathRef = useRef<SVGPathElement | null>(null);
  const clipPathElementRef = useRef<SVGPathElement | null>(null);
  const floatingOrbRef = useRef<HTMLDivElement | null>(null);
  const orbIconWrapRef = useRef<HTMLDivElement | null>(null);
  const slidingPillRef = useRef<HTMLDivElement | null>(null);

  const currentNotchXRef = useRef<number>(getTabCenterX(activeIndex, 332, tabs.length));
  const animFrameRef = useRef<number | null>(null);
  const prevIndexRef = useRef<number>(activeIndex);
  const prevModeRef = useRef<NavAnimMode>(navMode);

  const [waveTarget, setWaveTarget] = useState<{ index: number; id: number } | null>(null);
  const [displayedOrbTab, setDisplayedOrbTab] = useState<T>(activeTab);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const lastActionTimeRef = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      if (el.clientWidth > 0) {
        setNavWidth(el.clientWidth);
      }
    };
    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const targetX = getTabCenterX(activeIndex, navWidth, tabs.length);
    const isTabChanged = prevIndexRef.current !== activeIndex;
    const isModeChanged = prevModeRef.current !== navMode;
    prevIndexRef.current = activeIndex;
    prevModeRef.current = navMode;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const pathEl = panelPathRef.current;
    const clipEl = clipPathElementRef.current;
    const orbEl = floatingOrbRef.current;
    const orbIconWrap = orbIconWrapRef.current;
    const pillEl = slidingPillRef.current;

    if (!pathEl || !orbEl || !pillEl) return;

    if (navMode === 'pill') {
      const flatD = buildFlatPanel({ width: navWidth, bottomCornerRadius });
      pathEl.setAttribute('d', flatD);
      if (clipEl) clipEl.setAttribute('d', flatD);
      orbEl.style.opacity = '0';
      pillEl.style.opacity = '1';

      const pillW = 64;
      const targetLeft = targetX - pillW / 2;
      pillEl.style.transition = !isTabChanged || isModeChanged
        ? 'none'
        : 'left 360ms cubic-bezier(0.18, 0.9, 0.22, 1.05), transform 240ms ease';
      pillEl.style.left = `${targetLeft}px`;
      currentNotchXRef.current = targetX;
      return;
    }

    orbEl.style.opacity = '1';
    pillEl.style.opacity = '0';

    const startXPos = currentNotchXRef.current;
    const deltaX = targetX - startXPos;

    if (!isTabChanged || Math.abs(deltaX) < 0.5) {
      currentNotchXRef.current = targetX;
      orbEl.style.left = `${targetX}px`;
      orbEl.style.top = `22px`;
      orbEl.style.transform = 'translate(-50%, -50%) scale(1)';

      const notchD = buildSymmetricalNotch({
        width: navWidth,
        centerX: targetX,
        bottomCornerRadius,
      });
      pathEl.setAttribute('d', notchD);
      if (clipEl) clipEl.setAttribute('d', notchD);

      setDisplayedOrbTab(activeTab);
      setIsTransitioning(false);
      if (orbIconWrap) {
        orbIconWrap.style.opacity = '1';
        orbIconWrap.style.transform = 'scale(1)';
      }
      return;
    }

    setIsTransitioning(true);

    const baseDuration = 300;
    const speedMult = activeTheme.speedMultiplier || 1.0;
    const duration = Math.min(
      480,
      Math.max(300, (baseDuration + Math.sqrt(Math.abs(deltaX)) * 7.8) / speedMult)
    );

    const startTime = performance.now();
    let hasSwitchedIcon = false;

    function step(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      const ease = calculateDynamicEase(t);
      const x = startXPos + deltaX * ease;
      currentNotchXRef.current = x;

      const hopHeight = Math.min(13, Math.abs(deltaX) * 0.082);
      const arcProgress = Math.sin(Math.pow(t, 0.72) * Math.PI);
      const arcY = arcProgress * hopHeight;

      const stretchAmount = Math.min(0.18, (Math.abs(deltaX) / 320) * 0.22) * Math.sin(t * Math.PI);
      let scaleX = 1 + stretchAmount;
      let scaleY = 1 - stretchAmount * 0.65;

      if (t > 0.88) {
        const landingT = (t - 0.88) / 0.12;
        const landingSquash = Math.sin(landingT * Math.PI) * 0.045;
        scaleX = 1 - landingSquash;
        scaleY = 1 + landingSquash;
      }

      if (orbEl && pathEl) {
        orbEl.style.left = `${x}px`;
        orbEl.style.top = `${22 - arcY}px`;
        orbEl.style.transform = `translate(-50%, -50%) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;

        const notchD = buildSymmetricalNotch({
          width: navWidth,
          centerX: x,
          bottomCornerRadius,
        });
        pathEl.setAttribute('d', notchD);
        if (clipEl) clipEl.setAttribute('d', notchD);
      }

      if (orbIconWrap) {
        if (t < 0.22) {
          const p = t / 0.22;
          orbIconWrap.style.opacity = `${Math.max(0, 1 - p * 1.15)}`;
          orbIconWrap.style.transform = `scale(${1 - 0.18 * p})`;
        } else if (t < 0.68) {
          orbIconWrap.style.opacity = '0';
          if (!hasSwitchedIcon) {
            setDisplayedOrbTab(activeTab);
            hasSwitchedIcon = true;
          }
        } else {
          if (!hasSwitchedIcon) {
            setDisplayedOrbTab(activeTab);
            hasSwitchedIcon = true;
          }
          const p = (t - 0.68) / 0.32;
          orbIconWrap.style.opacity = `${p}`;
          orbIconWrap.style.transform = `scale(${0.84 + 0.16 * p})`;
        }
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        currentNotchXRef.current = targetX;
        if (orbEl && pathEl) {
          orbEl.style.left = `${targetX}px`;
          orbEl.style.top = `22px`;
          orbEl.style.transform = 'translate(-50%, -50%) scale(1)';

          const finalD = buildSymmetricalNotch({
            width: navWidth,
            centerX: targetX,
            bottomCornerRadius,
          });
          pathEl.setAttribute('d', finalD);
          if (clipEl) clipEl.setAttribute('d', finalD);
        }
        if (orbIconWrap) {
          orbIconWrap.style.opacity = '1';
          orbIconWrap.style.transform = 'scale(1)';
        }
        setIsTransitioning(false);
        triggerTabLandingHaptic(effectiveHapticProfile);
      }
    }

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [
    activeIndex,
    activeTab,
    navMode,
    navWidth,
    tabs.length,
    bottomCornerRadius,
    activeTheme,
    effectiveHapticProfile,
  ]);

  const handleTabTrigger = (tabId: T, idx: number) => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < 160) return;
    lastActionTimeRef.current = now;

    if (idx === activeIndex) {
      triggerHaptic('selection');
      return;
    }

    triggerTabTouchHaptic(effectiveHapticProfile);

    if (activeTheme.showWave !== false) {
      setWaveTarget({ index: idx, id: now });
    }

    onSelectTab(tabId);
  };

  const ActiveOrbIcon =
    tabs.find((t) => t.id === displayedOrbTab)?.icon || tabs[activeIndex]?.icon || Box;

  const currentNotchD = useMemo(() => {
    const cx = getTabCenterX(activeIndex, navWidth, tabs.length);
    return navMode === 'pill'
      ? buildFlatPanel({ width: navWidth, bottomCornerRadius })
      : buildSymmetricalNotch({ width: navWidth, centerX: cx, bottomCornerRadius });
  }, [activeIndex, navWidth, tabs.length, navMode, bottomCornerRadius]);

  const orbSize = activeTheme.orbSize || 46;

  return (
    <nav
      aria-label="Bottom Navigation"
      className={`relative w-full px-0 pb-[max(calc(env(safe-area-inset-bottom,0px)),0px)] z-30 shrink-0 select-none bg-transparent ${className}`}
      style={style}
    >
      <div ref={containerRef} className="relative w-full h-[90px] bg-transparent">
        {/* Floating Orb */}
        <div
          ref={floatingOrbRef}
          style={{
            left: `${getTabCenterX(activeIndex, navWidth, tabs.length)}px`,
            top: '22px',
            width: `${orbSize}px`,
            height: `${orbSize}px`,
            background: activeTheme.orbGradient,
            boxShadow: activeTheme.orbGlow,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center pointer-events-none z-30 will-change-transform"
        >
          <div
            style={{
              backgroundColor: activeTheme.orbGlassHighlight || 'rgba(255, 255, 255, 0.38)',
            }}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-2.5 rounded-full blur-[1px]"
          />
          <div
            ref={orbIconWrapRef}
            style={{ color: activeTheme.orbIconColor || '#FFFFFF' }}
            className="relative z-10 flex items-center justify-center will-change-transform"
          >
            <ActiveOrbIcon size={21} strokeWidth={2.2} />
          </div>
        </div>

        {/* Sliding Pill Mode */}
        <div
          ref={slidingPillRef}
          style={{
            left: `${getTabCenterX(activeIndex, navWidth, tabs.length) - 32}px`,
          }}
          className="sliding-pill absolute top-[33px] w-[64px] opacity-0 pointer-events-none z-10"
        />

        {/* Backdrop Blur Layer via SVG ClipPath */}
        <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <defs>
            <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
              <path ref={clipPathElementRef} d={currentNotchD} />
            </clipPath>
          </defs>
        </svg>

        <div
          style={{
            clipPath: `url(#${clipPathId})`,
            WebkitClipPath: `url(#${clipPathId})`,
            backdropFilter: `blur(${activeTheme.backdropBlur || '20px'})`,
            WebkitBackdropFilter: `blur(${activeTheme.backdropBlur || '20px'})`,
            backgroundColor: activeTheme.backdropBg || 'rgba(20, 16, 30, 0.35)',
          }}
          className="absolute inset-0 pointer-events-none z-[8]"
        />

        {/* Glass SVG with Gradient & Border Stroke */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox={`0 0 ${navWidth} 90`}
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={glassGradId} x1="0" y1="22" x2="0" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={activeTheme.glassFillStart} />
              <stop offset="100%" stopColor={activeTheme.glassFillEnd} />
            </linearGradient>
            <linearGradient
              id={strokeGradId}
              x1="0"
              y1="22"
              x2={navWidth}
              y2="90"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={activeTheme.glassStrokeStart} />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.16)" />
              <stop offset="100%" stopColor={activeTheme.glassStrokeEnd} />
            </linearGradient>
          </defs>
          <path
            ref={panelPathRef}
            d={currentNotchD}
            fill={`url(#${glassGradId})`}
            stroke={`url(#${strokeGradId})`}
            strokeWidth={activeTheme.glassStrokeWidth ?? 1.3}
          />
        </svg>

        {/* Tab Buttons */}
        <div
          className="absolute inset-x-0 top-[22px] bottom-0 px-3 grid items-center z-20"
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
          }}
        >
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = idx === activeIndex;

            const iconOpacity = isActive ? 0 : 1;
            const iconTransform = isActive ? 'scale(0.8)' : 'scale(1)';

            const labelOpacity = isActive && !isTransitioning ? 1 : 0;
            const labelTransform = isActive && !isTransitioning ? 'translateY(0px)' : 'translateY(6px)';

            return (
              <button
                key={tab.id}
                type="button"
                aria-label={tab.label}
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  handleTabTrigger(tab.id, idx);
                }}
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="nav-tab-btn relative h-full flex flex-col items-center justify-center cursor-pointer group focus:outline-none"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Resonance Wave */}
                {waveTarget && waveTarget.index === idx && (
                  <div
                    key={waveTarget.id}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                  >
                    <div
                      style={{ borderColor: activeTheme.waveColor || '#FFFFFF' }}
                      className="absolute top-1/2 left-1/2 w-9 h-9 rounded-full border-2 animate-mech-wave pointer-events-none"
                    />
                    <div
                      style={{ borderColor: `${activeTheme.waveColor || '#FFFFFF'}88` }}
                      className="absolute top-1/2 left-1/2 w-9 h-9 rounded-full border animate-mech-echo pointer-events-none"
                    />
                  </div>
                )}

                {/* Optional Badge */}
                {tab.badge !== undefined && (
                  <span
                    style={{
                      backgroundColor: tab.badgeColor || '#EF4444',
                    }}
                    className="absolute top-2 right-2 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-md z-30"
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Tab Icon */}
                <div
                  style={{
                    opacity: iconOpacity,
                    transform: iconTransform,
                    color: activeTheme.inactiveColor || 'rgba(255, 255, 255, 0.56)',
                    transition: 'opacity 220ms ease, transform 220ms ease, color 150ms ease',
                  }}
                  className="tab-icon-wrap flex items-center justify-center group-hover:opacity-100"
                >
                  <Icon size={21} strokeWidth={2} />
                </div>

                {/* Tab Label */}
                {showLabels && (
                  <span
                    style={{
                      opacity: labelOpacity,
                      transform: labelTransform,
                      color: activeTheme.activeLabelColor || '#FFFFFF',
                      textShadow: activeTheme.activeLabelGlow,
                      transition: 'opacity 200ms ease, transform 200ms ease',
                    }}
                    className="tab-label absolute bottom-[9px] text-[10.5px] font-semibold pointer-events-none tracking-wide"
                  >
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
