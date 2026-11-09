'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Home, Compass, PlusCircle, User, Box } from 'lucide-react';
import {
  triggerTabTouchHaptic,
  triggerTabLandingHaptic,
  cancelPendingHaptics,
  HapticProfile,
} from '../lib/haptics';
import {
  buildSymmetricalNotch,
  buildFlatPanel,
  getTabCenterX,
  calculateTransitDuration,
  computeFramePhysics,
} from '../lib/notch-math';

export type NavAnimMode = 'notch' | 'pill';
export type OrbStyle = 'flat' | '3d';

/**
 * Defines how notification badges behave when a tab becomes active:
 * - 'orb-satellite': Badge migrates from the dock onto the top-right rim of the floating circle/orb.
 * - 'label-inline': Badge docks as a compact pill right next to the active tab label at the bottom.
 */
export type BadgeBehavior = 'orb-satellite' | 'label-inline';

export interface NavIconRenderContext {
  isActive: boolean;
  placement: 'orb' | 'dock';
  size: number;
  strokeWidth: number;
}

export type NavIconComponent = React.ComponentType<{
  className?: string;
  size?: number;
  strokeWidth?: number;
}>;

/**
 * Supports:
 * 1. Standard icon component (e.g. Lucide, SVGR, or custom React component)
 * 2. Custom JSX / SVG node directly (e.g. <svg viewBox="0 0 24 24">...</svg>)
 */
export type NavIconProp = NavIconComponent | React.ReactNode;

export interface NavItem<T extends string = string> {
  id: T;
  label: string;
  /**
   * Standard component (e.g. Home from lucide-react) OR a custom JSX/SVG node (<svg>...</svg>)
   */
  icon?: NavIconProp;
  /**
   * Optional separate icon component or SVG node rendered when the tab is active (inside the 3D orb or active pill)
   */
  activeIcon?: NavIconProp;
  /**
   * Optional explicit prop for passing a raw custom SVG node (<svg>...</svg>)
   */
  svgNode?: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

export type NavThemePreset =
  // Author's Signature Curated Presets
  | 'obsidian-titanium'
  | 'rose-quartz'
  | 'aurora-borealis'
  | 'nordic-frost'
  | 'solar-champagne'
  | 'deep-ocean-pearl'
  // Classic Repository Presets (Refined)
  | 'purple-neon'
  | 'cyber-emerald'
  | 'sunset-amber'
  | 'electric-cyan'
  | 'clean-light'
  | 'mono-dark';

export interface NavThemeConfig {
  name?: string;
  category?: 'signature' | 'classic';
  description?: string;
  // Flat 2D Circle (default) & 3D Sphere
  orbFlatGradient?: string;
  orbFlatGlow?: string;
  orbGradient?: string;
  orbGlow?: string;
  orbGlassHighlight?: string;
  orbRimGlow?: string;
  orbIconColor?: string;
  orbSize?: number;
  // Sliding Pill mode colors
  pillBg?: string;
  pillBorder?: string;
  pillGlow?: string;
  // Glass Panel SVG
  glassFillStart?: string;
  glassFillEnd?: string;
  glassStrokeStart?: string;
  glassStrokeMid?: string;
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

export interface TelemetryFrame {
  phase: 'idle' | 'in-flight' | 'landed';
  x: number;
  arcY: number;
  scaleX: number;
  scaleY: number;
  progress: number;
  distancePx: number;
  durationMs: number;
}

export const THEME_PRESETS: Record<NavThemePreset, NavThemeConfig> = {
  // ============================================================================
  // 1. SIGNATURE CURATED THEMES
  // ============================================================================
  'obsidian-titanium': {
    name: 'Obsidian Titanium',
    category: 'signature',
    orbFlatGradient: 'linear-gradient(135deg, #52525B 0%, #27272A 100%)',
    orbFlatGlow: '0 6px 20px rgba(0, 0, 0, 0.55)',
    orbGradient:
      'radial-gradient(circle at 34% 22%, #F4F4F6 0%, #71717A 30%, #27272A 68%, #09090B 100%)',
    orbGlow:
      '0 10px 26px -3px rgba(0, 0, 0, 0.85), 0 0 18px rgba(228, 228, 231, 0.22), inset 0 2px 4px rgba(255, 255, 255, 0.55)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.42)',
    orbRimGlow: 'rgba(244, 244, 245, 0.25)',
    orbIconColor: '#FAFAFA',
    orbSize: 46,
    pillBg: 'rgba(255, 255, 255, 0.12)',
    pillBorder: 'rgba(255, 255, 255, 0.24)',
    pillGlow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    glassFillStart: 'rgba(24, 24, 28, 0.68)',
    glassFillEnd: 'rgba(10, 10, 13, 0.88)',
    glassStrokeStart: 'rgba(255, 255, 255, 0.22)',
    glassStrokeMid: 'rgba(255, 255, 255, 0.10)',
    glassStrokeEnd: 'rgba(161, 161, 170, 0.14)',
    glassStrokeWidth: 1.2,
    backdropBlur: '24px',
    backdropBg: 'rgba(9, 9, 11, 0.44)',
    inactiveColor: 'rgba(161, 161, 170, 0.68)',
    inactiveHoverColor: 'rgba(250, 250, 250, 0.96)',
    activeLabelColor: '#F4F4F5',
    activeLabelGlow: '0 1px 8px rgba(255, 255, 255, 0.22)',
    waveColor: '#E4E4E7',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'rose-quartz': {
    name: 'Rose Quartz',
    category: 'signature',
    orbFlatGradient: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
    orbFlatGlow: '0 6px 20px rgba(244, 63, 94, 0.45)',
    orbGradient:
      'radial-gradient(circle at 35% 24%, #FFE4E6 0%, #FB7185 32%, #E11D48 70%, #881337 100%)',
    orbGlow:
      '0 10px 26px -3px rgba(225, 29, 72, 0.68), 0 0 18px rgba(251, 113, 133, 0.45), inset 0 2.5px 5px rgba(255, 255, 255, 0.68)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.48)',
    orbRimGlow: 'rgba(254, 205, 211, 0.38)',
    orbIconColor: '#FFF1F2',
    orbSize: 46,
    pillBg: 'rgba(244, 63, 94, 0.22)',
    pillBorder: 'rgba(251, 113, 133, 0.42)',
    pillGlow: '0 4px 16px rgba(225, 29, 72, 0.3)',
    glassFillStart: 'rgba(38, 16, 25, 0.56)',
    glassFillEnd: 'rgba(21, 9, 15, 0.82)',
    glassStrokeStart: 'rgba(254, 205, 211, 0.28)',
    glassStrokeMid: 'rgba(251, 113, 133, 0.14)',
    glassStrokeEnd: 'rgba(244, 63, 94, 0.18)',
    glassStrokeWidth: 1.2,
    backdropBlur: '22px',
    backdropBg: 'rgba(28, 10, 18, 0.36)',
    inactiveColor: 'rgba(254, 205, 211, 0.58)',
    inactiveHoverColor: 'rgba(255, 241, 242, 0.95)',
    activeLabelColor: '#FFE4E6',
    activeLabelGlow: '0 1px 8px rgba(244, 63, 94, 0.4)',
    waveColor: '#FB7185',
    showWave: true,
    hapticProfile: 'crisp',
  },
  'aurora-borealis': {
    name: 'Aurora Borealis',
    category: 'signature',
    orbFlatGradient: 'linear-gradient(135deg, #635BFF 0%, #38BDF8 100%)',
    orbFlatGlow: '0 6px 22px rgba(99, 91, 255, 0.48)',
    orbGradient:
      'radial-gradient(circle at 32% 24%, #CCFBF1 0%, #2DD4BF 28%, #4F46E5 68%, #1E1B4B 100%)',
    orbGlow:
      '0 10px 26px -2px rgba(45, 212, 191, 0.62), 0 0 18px rgba(99, 102, 241, 0.52), inset 0 2.5px 5px rgba(255, 255, 255, 0.65)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.45)',
    orbRimGlow: 'rgba(153, 246, 228, 0.35)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,
    pillBg: 'rgba(45, 212, 191, 0.18)',
    pillBorder: 'rgba(94, 234, 212, 0.38)',
    pillGlow: '0 4px 18px rgba(45, 212, 191, 0.28)',
    glassFillStart: 'rgba(32, 29, 48, 0.78)',
    glassFillEnd: 'rgba(22, 20, 36, 0.92)',
    glassStrokeStart: 'rgba(255, 255, 255, 0.16)',
    glassStrokeMid: 'rgba(129, 140, 248, 0.12)',
    glassStrokeEnd: 'rgba(99, 102, 241, 0.14)',
    glassStrokeWidth: 1.2,
    backdropBlur: '22px',
    backdropBg: 'rgba(18, 16, 30, 0.45)',
    inactiveColor: 'rgba(203, 213, 225, 0.62)',
    inactiveHoverColor: 'rgba(240, 253, 250, 0.96)',
    activeLabelColor: '#E2E8F0',
    activeLabelGlow: 'none',
    waveColor: '#38BDF8',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'nordic-frost': {
    name: 'Nordic Alabaster',
    category: 'signature',
    orbFlatGradient: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
    orbFlatGlow: '0 6px 18px rgba(15, 23, 42, 0.32)',
    orbGradient:
      'radial-gradient(circle at 35% 24%, #E2E8F0 0%, #475569 32%, #1E293B 72%, #0F172A 100%)',
    orbGlow:
      '0 10px 24px -3px rgba(15, 23, 42, 0.42), 0 4px 12px rgba(51, 65, 85, 0.28), inset 0 2px 4px rgba(255, 255, 255, 0.72)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.6)',
    orbRimGlow: 'rgba(255, 255, 255, 0.4)',
    orbIconColor: '#F8FAFC',
    orbSize: 46,
    pillBg: 'rgba(15, 23, 42, 0.1)',
    pillBorder: 'rgba(15, 23, 42, 0.2)',
    pillGlow: '0 4px 12px rgba(15, 23, 42, 0.08)',
    glassFillStart: 'rgba(255, 255, 255, 0.84)',
    glassFillEnd: 'rgba(241, 245, 249, 0.94)',
    glassStrokeStart: 'rgba(255, 255, 255, 0.98)',
    glassStrokeMid: 'rgba(226, 232, 240, 0.7)',
    glassStrokeEnd: 'rgba(148, 163, 184, 0.42)',
    glassStrokeWidth: 1.2,
    backdropBlur: '24px',
    backdropBg: 'rgba(255, 255, 255, 0.52)',
    inactiveColor: 'rgba(71, 85, 105, 0.75)',
    inactiveHoverColor: 'rgba(15, 23, 42, 0.98)',
    activeLabelColor: '#0F172A',
    activeLabelGlow: 'none',
    waveColor: '#334155',
    showWave: true,
    hapticProfile: 'crisp',
  },
  'solar-champagne': {
    name: 'Solar Champagne',
    category: 'signature',
    orbFlatGradient: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
    orbFlatGlow: '0 6px 20px rgba(245, 158, 11, 0.42)',
    orbGradient:
      'radial-gradient(circle at 36% 24%, #FEF9C3 0%, #EAB308 32%, #CA8A04 68%, #713F12 100%)',
    orbGlow:
      '0 10px 26px -3px rgba(202, 138, 4, 0.65), 0 0 18px rgba(250, 204, 21, 0.42), inset 0 2.5px 5px rgba(255, 255, 255, 0.7)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.5)',
    orbRimGlow: 'rgba(254, 240, 138, 0.38)',
    orbIconColor: '#FEFCE8',
    orbSize: 46,
    pillBg: 'rgba(234, 179, 8, 0.2)',
    pillBorder: 'rgba(250, 204, 21, 0.4)',
    pillGlow: '0 4px 16px rgba(202, 138, 4, 0.3)',
    glassFillStart: 'rgba(32, 26, 18, 0.6)',
    glassFillEnd: 'rgba(18, 14, 9, 0.86)',
    glassStrokeStart: 'rgba(254, 240, 138, 0.26)',
    glassStrokeMid: 'rgba(234, 179, 8, 0.14)',
    glassStrokeEnd: 'rgba(161, 98, 7, 0.2)',
    glassStrokeWidth: 1.2,
    backdropBlur: '22px',
    backdropBg: 'rgba(24, 19, 12, 0.4)',
    inactiveColor: 'rgba(231, 229, 228, 0.58)',
    inactiveHoverColor: 'rgba(254, 249, 195, 0.96)',
    activeLabelColor: '#FEF08A',
    activeLabelGlow: 'none',
    waveColor: '#FACC15',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'deep-ocean-pearl': {
    name: 'Deep Ocean Pearl',
    category: 'signature',
    orbFlatGradient: 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
    orbFlatGlow: '0 6px 20px rgba(14, 165, 233, 0.45)',
    orbGradient:
      'radial-gradient(circle at 36% 24%, #E0F2FE 0%, #38BDF8 30%, #0284C7 68%, #1E3A8A 100%)',
    orbGlow:
      '0 10px 26px -3px rgba(2, 132, 199, 0.72), 0 0 18px rgba(56, 189, 248, 0.48), inset 0 2.5px 5px rgba(255, 255, 255, 0.68)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.46)',
    orbRimGlow: 'rgba(186, 230, 253, 0.36)',
    orbIconColor: '#F0F9FF',
    orbSize: 46,
    pillBg: 'rgba(14, 165, 233, 0.22)',
    pillBorder: 'rgba(56, 189, 248, 0.42)',
    pillGlow: '0 4px 16px rgba(2, 132, 199, 0.32)',
    glassFillStart: 'rgba(12, 24, 44, 0.58)',
    glassFillEnd: 'rgba(7, 14, 28, 0.85)',
    glassStrokeStart: 'rgba(186, 230, 253, 0.28)',
    glassStrokeMid: 'rgba(56, 189, 248, 0.14)',
    glassStrokeEnd: 'rgba(3, 105, 161, 0.2)',
    glassStrokeWidth: 1.2,
    backdropBlur: '22px',
    backdropBg: 'rgba(8, 18, 36, 0.38)',
    inactiveColor: 'rgba(186, 230, 253, 0.58)',
    inactiveHoverColor: 'rgba(240, 249, 255, 0.96)',
    activeLabelColor: '#E0F2FE',
    activeLabelGlow: 'none',
    waveColor: '#38BDF8',
    showWave: true,
    hapticProfile: 'soft',
  },

  // ============================================================================
  // 2. CLASSIC REPOSITORY THEMES
  // ============================================================================
  'purple-neon': {
    name: 'Purple Neon',
    category: 'classic',
    orbFlatGradient: 'linear-gradient(135deg, #6658EA 0%, #3AA9D8 100%)',
    orbFlatGlow: '0 6px 22px rgba(102, 88, 234, 0.48)',
    orbGradient:
      'radial-gradient(circle at 38% 24%, #F2DBFF 0%, #C165FF 28%, #8A2BE2 68%, #4E119A 100%)',
    orbGlow:
      '0 8px 24px -2px rgba(155, 55, 255, 0.78), 0 0 16px rgba(181, 69, 255, 0.55), inset 0 2.5px 5px rgba(255, 255, 255, 0.65)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.38)',
    orbRimGlow: 'rgba(233, 213, 255, 0.32)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,
    pillBg: 'rgba(168, 85, 247, 0.24)',
    pillBorder: 'rgba(216, 180, 254, 0.42)',
    pillGlow: '0 4px 16px rgba(147, 51, 234, 0.35)',
    glassFillStart: 'rgba(33, 28, 48, 0.76)',
    glassFillEnd: 'rgba(22, 19, 34, 0.92)',
    glassStrokeStart: 'rgba(216, 180, 254, 0.18)',
    glassStrokeEnd: 'rgba(216, 180, 254, 0.10)',
    glassStrokeWidth: 1.2,
    backdropBlur: '20px',
    backdropBg: 'rgba(20, 16, 30, 0.38)',
    inactiveColor: 'rgba(255, 255, 255, 0.56)',
    inactiveHoverColor: 'rgba(255, 255, 255, 0.90)',
    activeLabelColor: 'rgba(226, 232, 240, 0.95)',
    activeLabelGlow: 'none',
    waveColor: '#818CF8',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'cyber-emerald': {
    name: 'Cyber Emerald',
    category: 'classic',
    orbFlatGradient: 'linear-gradient(135deg, #10B981 0%, #0D9488 100%)',
    orbFlatGlow: '0 6px 20px rgba(16, 185, 129, 0.45)',
    orbGradient:
      'radial-gradient(circle at 38% 24%, #D1FAE5 0%, #34D399 28%, #059669 68%, #064E3B 100%)',
    orbGlow:
      '0 8px 24px -2px rgba(16, 185, 129, 0.75), 0 0 16px rgba(52, 211, 153, 0.55), inset 0 2.5px 5px rgba(255, 255, 255, 0.65)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.42)',
    orbRimGlow: 'rgba(167, 243, 208, 0.32)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,
    pillBg: 'rgba(16, 185, 129, 0.22)',
    pillBorder: 'rgba(110, 231, 183, 0.4)',
    pillGlow: '0 4px 16px rgba(16, 185, 129, 0.32)',
    glassFillStart: 'rgba(14, 34, 27, 0.58)',
    glassFillEnd: 'rgba(8, 22, 17, 0.82)',
    glassStrokeStart: 'rgba(110, 231, 183, 0.24)',
    glassStrokeEnd: 'rgba(16, 185, 129, 0.16)',
    glassStrokeWidth: 1.2,
    backdropBlur: '20px',
    backdropBg: 'rgba(10, 25, 20, 0.35)',
    inactiveColor: 'rgba(255, 255, 255, 0.58)',
    inactiveHoverColor: 'rgba(255, 255, 255, 0.92)',
    activeLabelColor: 'rgba(167, 243, 208, 0.96)',
    activeLabelGlow: 'none',
    waveColor: '#34D399',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'sunset-amber': {
    name: 'Sunset Amber',
    category: 'classic',
    orbFlatGradient: 'linear-gradient(135deg, #F59E0B 0%, #E11D48 100%)',
    orbFlatGlow: '0 6px 20px rgba(245, 158, 11, 0.45)',
    orbGradient:
      'radial-gradient(circle at 38% 24%, #FEF3C7 0%, #F59E0B 28%, #D97706 68%, #78350F 100%)',
    orbGlow:
      '0 8px 24px -2px rgba(245, 158, 11, 0.75), 0 0 16px rgba(251, 191, 36, 0.55), inset 0 2.5px 5px rgba(255, 255, 255, 0.65)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.42)',
    orbRimGlow: 'rgba(253, 230, 138, 0.32)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,
    pillBg: 'rgba(245, 158, 11, 0.22)',
    pillBorder: 'rgba(252, 211, 77, 0.4)',
    pillGlow: '0 4px 16px rgba(245, 158, 11, 0.32)',
    glassFillStart: 'rgba(38, 24, 14, 0.58)',
    glassFillEnd: 'rgba(22, 13, 8, 0.82)',
    glassStrokeStart: 'rgba(252, 211, 77, 0.24)',
    glassStrokeEnd: 'rgba(245, 158, 11, 0.16)',
    glassStrokeWidth: 1.2,
    backdropBlur: '20px',
    backdropBg: 'rgba(28, 17, 10, 0.35)',
    inactiveColor: 'rgba(255, 255, 255, 0.58)',
    inactiveHoverColor: 'rgba(255, 255, 255, 0.92)',
    activeLabelColor: 'rgba(253, 230, 138, 0.96)',
    activeLabelGlow: 'none',
    waveColor: '#F59E0B',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'electric-cyan': {
    name: 'Electric Cyan',
    category: 'classic',
    orbFlatGradient: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    orbFlatGlow: '0 6px 20px rgba(6, 182, 212, 0.45)',
    orbGradient:
      'radial-gradient(circle at 38% 24%, #CFFAFE 0%, #06B6D4 28%, #0284C7 68%, #0C4A6E 100%)',
    orbGlow:
      '0 8px 24px -2px rgba(6, 182, 212, 0.75), 0 0 16px rgba(56, 189, 248, 0.55), inset 0 2.5px 5px rgba(255, 255, 255, 0.65)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.42)',
    orbRimGlow: 'rgba(165, 243, 252, 0.32)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,
    pillBg: 'rgba(6, 182, 212, 0.22)',
    pillBorder: 'rgba(103, 232, 249, 0.4)',
    pillGlow: '0 4px 16px rgba(6, 182, 212, 0.32)',
    glassFillStart: 'rgba(12, 26, 42, 0.58)',
    glassFillEnd: 'rgba(6, 16, 28, 0.82)',
    glassStrokeStart: 'rgba(103, 232, 249, 0.24)',
    glassStrokeEnd: 'rgba(14, 165, 233, 0.16)',
    glassStrokeWidth: 1.2,
    backdropBlur: '20px',
    backdropBg: 'rgba(8, 20, 34, 0.35)',
    inactiveColor: 'rgba(255, 255, 255, 0.58)',
    inactiveHoverColor: 'rgba(255, 255, 255, 0.92)',
    activeLabelColor: 'rgba(186, 230, 253, 0.96)',
    activeLabelGlow: 'none',
    waveColor: '#38BDF8',
    showWave: true,
    hapticProfile: 'mechanical',
  },
  'clean-light': {
    name: 'Clean Light',
    category: 'classic',
    orbFlatGradient: 'linear-gradient(135deg, #6366F1 0%, #38BDF8 100%)',
    orbFlatGlow: '0 6px 18px rgba(99, 102, 241, 0.35)',
    orbGradient:
      'radial-gradient(circle at 38% 24%, #EEF2FF 0%, #6366F1 32%, #4338CA 72%, #312E81 100%)',
    orbGlow:
      '0 8px 22px -2px rgba(79, 70, 229, 0.45), 0 0 14px rgba(99, 102, 241, 0.35), inset 0 2.5px 5px rgba(255, 255, 255, 0.8)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.65)',
    orbRimGlow: 'rgba(199, 210, 254, 0.4)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,
    pillBg: 'rgba(99, 102, 241, 0.16)',
    pillBorder: 'rgba(99, 102, 241, 0.35)',
    pillGlow: '0 4px 14px rgba(99, 102, 241, 0.2)',
    glassFillStart: 'rgba(255, 255, 255, 0.82)',
    glassFillEnd: 'rgba(241, 245, 249, 0.94)',
    glassStrokeStart: 'rgba(255, 255, 255, 0.95)',
    glassStrokeEnd: 'rgba(148, 163, 184, 0.40)',
    glassStrokeWidth: 1.2,
    backdropBlur: '24px',
    backdropBg: 'rgba(255, 255, 255, 0.45)',
    inactiveColor: 'rgba(51, 65, 85, 0.72)',
    inactiveHoverColor: 'rgba(15, 23, 42, 0.95)',
    activeLabelColor: '#312E81',
    activeLabelGlow: 'none',
    waveColor: '#6366F1',
    showWave: true,
    hapticProfile: 'crisp',
  },
  'mono-dark': {
    name: 'Mono Dark',
    category: 'classic',
    orbFlatGradient: 'linear-gradient(135deg, #475569 0%, #1E293B 100%)',
    orbFlatGlow: '0 6px 20px rgba(0, 0, 0, 0.55)',
    orbGradient:
      'radial-gradient(circle at 38% 24%, #F8FAFC 0%, #64748B 28%, #1E293B 70%, #020617 100%)',
    orbGlow:
      '0 8px 24px -2px rgba(0, 0, 0, 0.85), 0 0 16px rgba(255, 255, 255, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
    orbGlassHighlight: 'rgba(255, 255, 255, 0.45)',
    orbRimGlow: 'rgba(226, 232, 240, 0.25)',
    orbIconColor: '#FFFFFF',
    orbSize: 46,
    pillBg: 'rgba(148, 163, 184, 0.18)',
    pillBorder: 'rgba(203, 213, 225, 0.3)',
    pillGlow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    glassFillStart: 'rgba(15, 23, 42, 0.68)',
    glassFillEnd: 'rgba(2, 6, 23, 0.88)',
    glassStrokeStart: 'rgba(255, 255, 255, 0.18)',
    glassStrokeEnd: 'rgba(148, 163, 184, 0.12)',
    glassStrokeWidth: 1.2,
    backdropBlur: '20px',
    backdropBg: 'rgba(10, 15, 30, 0.4)',
    inactiveColor: 'rgba(148, 163, 184, 0.65)',
    inactiveHoverColor: 'rgba(248, 250, 252, 0.95)',
    activeLabelColor: '#F8FAFC',
    activeLabelGlow: 'none',
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
  /**
   * Optional dictionary of custom SVG nodes or context-aware renderers mapped by tab ID.
   * Allows overriding icons with custom SVG nodes directly via a top-level prop.
   */
  customIcons?: Partial<
    Record<T, React.ReactNode | ((ctx: NavIconRenderContext) => React.ReactNode)>
  >;
  /**
   * Optional custom icon render function for full control over active/inactive and orb/dock states.
   */
  renderIcon?: (tab: NavItem<T>, ctx: NavIconRenderContext) => React.ReactNode;
  theme?: NavThemePreset | NavThemeConfig;
  orbStyle?: OrbStyle;
  className?: string;
  style?: React.CSSProperties;
  showLabels?: boolean;
  bottomCornerRadius?: number;
  hapticProfile?: HapticProfile;
  speedMultiplier?: number;
  enableAudioTicks?: boolean;
  badgeBehavior?: BadgeBehavior;
  onTelemetryUpdate?: (frame: TelemetryFrame) => void;
}

function renderIconSource(
  source: NavIconProp | undefined,
  ctx: NavIconRenderContext
): React.ReactNode {
  if (!source) {
    return <Box size={ctx.size} strokeWidth={ctx.strokeWidth} />;
  }

  // If the consumer passed a JSX element directly (e.g. <svg>...</svg> or <MyCustomIcon />)
  if (React.isValidElement(source)) {
    return source;
  }

  // If the consumer passed a ComponentType (function component or forwardRef/memo exotic component like Lucide)
  if (
    typeof source === 'function' ||
    (typeof source === 'object' && source !== null && '$$typeof' in source)
  ) {
    const IconComp = source as NavIconComponent;
    return <IconComp size={ctx.size} strokeWidth={ctx.strokeWidth} />;
  }

  return <>{source}</>;
}

function svgPathToMaskDataUri(width: number, height: number, d: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><path d="${d}" fill="white"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function AdaptiveNotchNav<T extends string = string>({
  activeTab,
  onSelectTab,
  navMode = 'notch',
  orbStyle = 'flat',
  items,
  customIcons,
  renderIcon,
  theme: themeProp = 'purple-neon',
  className = '',
  style,
  showLabels = true,
  bottomCornerRadius = 0,
  hapticProfile: userHapticProfile,
  speedMultiplier: userSpeedMultiplier,
  enableAudioTicks = false,
  badgeBehavior = 'orb-satellite',
  onTelemetryUpdate,
}: AdaptiveNotchNavProps<T>) {
  const reactId = useId().replace(/:/g, '');
  const glassGradId = `panelGlassGrad-${reactId}`;
  const strokeGradId = `panelStrokeGrad-${reactId}`;

  const tabs: NavItem<T>[] =
    (items as NavItem<T>[]) || (DEFAULT_STANDARD_TABS as unknown as NavItem<T>[]);

  const activeTheme: NavThemeConfig = useMemo(() => {
    if (typeof themeProp === 'string') {
      return THEME_PRESETS[themeProp] || THEME_PRESETS['obsidian-titanium'];
    }
    return { ...THEME_PRESETS['obsidian-titanium'], ...themeProp };
  }, [themeProp]);

  const effectiveHapticProfile: HapticProfile =
    userHapticProfile || activeTheme.hapticProfile || 'mechanical';

  const effectiveSpeedMultiplier =
    userSpeedMultiplier ?? activeTheme.speedMultiplier ?? 1.0;

  const activeIndex = useMemo(() => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    return idx >= 0 ? idx : 0;
  }, [activeTab, tabs]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [navWidth, setNavWidth] = useState<number>(332);
  const [isReady, setIsReady] = useState<boolean>(false);

  const panelPathRef = useRef<SVGPathElement | null>(null);
  const backdropMaskDivRef = useRef<HTMLDivElement | null>(null);
  const floatingOrbRef = useRef<HTMLDivElement | null>(null);
  const orbIconWrapRef = useRef<HTMLDivElement | null>(null);
  const slidingPillRef = useRef<HTMLDivElement | null>(null);

  const currentNotchXRef = useRef<number>(getTabCenterX(activeIndex, 332, tabs.length));
  const animFrameRef = useRef<number | null>(null);
  const prevIndexRef = useRef<number>(activeIndex);
  const prevModeRef = useRef<NavAnimMode>(navMode);
  const prevTabsLenRef = useRef<number>(tabs.length);

  // Store callbacks and cosmetic configs in refs inside an effect so changing themes/handlers never interrupts an active flight
  const onTelemetryRef = useRef(onTelemetryUpdate);
  const hapticProfileRef = useRef<HapticProfile>(effectiveHapticProfile);
  const enableAudioRef = useRef<boolean>(enableAudioTicks);
  const speedMultRef = useRef<number>(effectiveSpeedMultiplier);
  const activeIndexRef = useRef<number>(activeIndex);
  const tabsLenRef = useRef<number>(tabs.length);

  useEffect(() => {
    onTelemetryRef.current = onTelemetryUpdate;
    hapticProfileRef.current = effectiveHapticProfile;
    enableAudioRef.current = enableAudioTicks;
    speedMultRef.current = effectiveSpeedMultiplier;
    activeIndexRef.current = activeIndex;
    tabsLenRef.current = tabs.length;
  }, [
    onTelemetryUpdate,
    effectiveHapticProfile,
    enableAudioTicks,
    effectiveSpeedMultiplier,
    activeIndex,
    tabs.length,
  ]);

  const [waveTarget, setWaveTarget] = useState<{ index: number; id: number } | null>(null);
  const [displayedOrbTab, setDisplayedOrbTab] = useState<T>(activeTab);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const lastActionTimeRef = useRef<number>(0);
  const waveIdCounterRef = useRef<number>(1);

  // Measure actual container width on mount and resize before revealing the orb
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el.clientWidth > 0) {
        const w = el.clientWidth;
        setNavWidth(w);
        setIsReady((prev) => {
          if (!prev) {
            currentNotchXRef.current = getTabCenterX(
              activeIndexRef.current,
              w,
              tabsLenRef.current
            );
          }
          return true;
        });
      }
    };

    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Cleanup pending haptics on unmount
  useEffect(() => {
    return () => {
      cancelPendingHaptics();
    };
  }, []);

  // Main Geometry & Physics Effect
  useEffect(() => {
    const targetX = getTabCenterX(activeIndex, navWidth, tabs.length);
    const isTabChanged = prevIndexRef.current !== activeIndex;
    const isModeChanged = prevModeRef.current !== navMode;
    const isTabsLenChanged = prevTabsLenRef.current !== tabs.length;

    prevIndexRef.current = activeIndex;
    prevModeRef.current = navMode;
    prevTabsLenRef.current = tabs.length;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const pathEl = panelPathRef.current;
    const maskDiv = backdropMaskDivRef.current;
    const orbEl = floatingOrbRef.current;
    const orbIconWrap = orbIconWrapRef.current;
    const pillEl = slidingPillRef.current;

    if (!pathEl || !orbEl || !pillEl) return;

    const applyGeometryD = (d: string) => {
      pathEl.setAttribute('d', d);
      if (maskDiv) {
        const uri = svgPathToMaskDataUri(navWidth, 90, d);
        maskDiv.style.maskImage = uri;
        maskDiv.style.webkitMaskImage = uri;
      }
    };

    // 1. Sliding Pill Mode
    if (navMode === 'pill') {
      const flatD = buildFlatPanel({ width: navWidth, bottomCornerRadius });
      applyGeometryD(flatD);

      orbEl.style.opacity = '0';
      orbEl.style.pointerEvents = 'none';
      pillEl.style.opacity = '1';

      const pillW = Math.min(72, Math.max(52, (navWidth - 24) / tabs.length - 12));
      const targetLeft = targetX - pillW / 2;

      pillEl.style.width = `${pillW}px`;
      pillEl.style.transition =
        !isTabChanged || isModeChanged || isTabsLenChanged
          ? 'none'
          : `left ${Math.round(340 / speedMultRef.current)}ms cubic-bezier(0.18, 0.9, 0.22, 1.05), width 220ms ease`;
      pillEl.style.left = `${targetLeft}px`;

      currentNotchXRef.current = targetX;
      animFrameRef.current = requestAnimationFrame(() => {
        setDisplayedOrbTab(activeTab);
        setIsTransitioning(false);
        onTelemetryRef.current?.({
          phase: 'idle',
          x: targetX,
          arcY: 0,
          scaleX: 1,
          scaleY: 1,
          progress: 1,
          distancePx: 0,
          durationMs: 0,
        });
      });
      return;
    }

    // 2. Fluid Notch + Floating Orb Mode
    orbEl.style.opacity = isReady ? '1' : '0';
    pillEl.style.opacity = '0';

    const startXPos = currentNotchXRef.current;
    const deltaX = targetX - startXPos;

    if ((!isTabChanged && !isTabsLenChanged) || isModeChanged || Math.abs(deltaX) < 0.5) {
      currentNotchXRef.current = targetX;
      orbEl.style.left = `${targetX}px`;
      orbEl.style.top = `22px`;
      orbEl.style.transform = 'translate(-50%, -50%) scale(1, 1)';

      const notchD = buildSymmetricalNotch({
        width: navWidth,
        centerX: targetX,
        bottomCornerRadius,
      });
      applyGeometryD(notchD);

      if (orbIconWrap) {
        orbIconWrap.style.opacity = '1';
        orbIconWrap.style.transform = 'scale(1)';
      }

      animFrameRef.current = requestAnimationFrame(() => {
        setDisplayedOrbTab(activeTab);
        setIsTransitioning(false);
        onTelemetryRef.current?.({
          phase: 'idle',
          x: targetX,
          arcY: 0,
          scaleX: 1,
          scaleY: 1,
          progress: 1,
          distancePx: 0,
          durationMs: 0,
        });
      });
      return;
    }

    // 3. Animated Non-Linear Flight
    const duration = calculateTransitDuration(deltaX, speedMultRef.current);
    const startTime = performance.now();
    let hasSwitchedIcon = false;
    let hasMarkedTransitioning = false;

    function step(now: number) {
      if (!hasMarkedTransitioning) {
        setIsTransitioning(true);
        hasMarkedTransitioning = true;
      }
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      const frame = computeFramePhysics(t, startXPos, deltaX);
      currentNotchXRef.current = frame.x;

      if (orbEl && pathEl) {
        orbEl.style.left = `${frame.x}px`;
        orbEl.style.top = `${22 - frame.arcY}px`;
        orbEl.style.transform = `translate(-50%, -50%) scale(${frame.scaleX.toFixed(3)}, ${frame.scaleY.toFixed(3)})`;

        const notchD = buildSymmetricalNotch({
          width: navWidth,
          centerX: frame.x,
          bottomCornerRadius,
        });
        applyGeometryD(notchD);
      }

      if (orbIconWrap) {
        if (frame.shouldSwitchIcon && !hasSwitchedIcon) {
          setDisplayedOrbTab(activeTab);
          hasSwitchedIcon = true;
        }
        orbIconWrap.style.opacity = `${frame.iconOpacity.toFixed(3)}`;
        orbIconWrap.style.transform = `scale(${frame.iconScale.toFixed(3)})`;
      }

      onTelemetryRef.current?.({
        phase: t < 1 ? 'in-flight' : 'landed',
        x: frame.x,
        arcY: frame.arcY,
        scaleX: frame.scaleX,
        scaleY: frame.scaleY,
        progress: t,
        distancePx: Math.abs(deltaX),
        durationMs: duration,
      });

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        currentNotchXRef.current = targetX;
        if (orbEl && pathEl) {
          orbEl.style.left = `${targetX}px`;
          orbEl.style.top = `22px`;
          orbEl.style.transform = 'translate(-50%, -50%) scale(1, 1)';
          const finalD = buildSymmetricalNotch({
            width: navWidth,
            centerX: targetX,
            bottomCornerRadius,
          });
          applyGeometryD(finalD);
        }
        if (orbIconWrap) {
          orbIconWrap.style.opacity = '1';
          orbIconWrap.style.transform = 'scale(1)';
        }
        setIsTransitioning(false);
        triggerTabLandingHaptic(hapticProfileRef.current, enableAudioRef.current);
      }
    }

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [activeIndex, activeTab, navMode, navWidth, tabs.length, bottomCornerRadius, isReady]);

  const handleTabTrigger = (tabId: T, idx: number, timeStamp: number) => {
    if (timeStamp > 0 && timeStamp - lastActionTimeRef.current < 40) return;
    lastActionTimeRef.current = timeStamp;

    triggerTabTouchHaptic(effectiveHapticProfile, enableAudioTicks);

    if (activeTheme.showWave !== false) {
      waveIdCounterRef.current += 1;
      setWaveTarget({ index: idx, id: waveIdCounterRef.current });
    }

    onSelectTab(tabId);
  };

  const resolveTabIconNode = (
    tab: NavItem<T> | undefined,
    ctx: NavIconRenderContext
  ): React.ReactNode => {
    if (!tab) {
      return <Box size={ctx.size} strokeWidth={ctx.strokeWidth} />;
    }

    if (renderIcon) {
      return renderIcon(tab, ctx);
    }

    const customOverride = customIcons?.[tab.id];
    if (customOverride !== undefined) {
      if (typeof customOverride === 'function') {
        return customOverride(ctx);
      }
      return customOverride;
    }

    if (ctx.isActive && tab.activeIcon !== undefined) {
      return renderIconSource(tab.activeIcon, ctx);
    }

    if (tab.svgNode !== undefined) {
      return tab.svgNode;
    }

    return renderIconSource(tab.icon, ctx);
  };

  const displayedOrbItem =
    tabs.find((t) => t.id === displayedOrbTab) || tabs[activeIndex];
  const activeOrbBadge =
    badgeBehavior === 'orb-satellite' &&
    displayedOrbItem?.badge !== undefined &&
    displayedOrbItem?.badge !== 0 &&
    displayedOrbItem?.badge !== '0'
      ? displayedOrbItem.badge
      : undefined;

  const currentNotchD = useMemo(() => {
    const cx = getTabCenterX(activeIndex, navWidth, tabs.length);
    return navMode === 'pill'
      ? buildFlatPanel({ width: navWidth, bottomCornerRadius })
      : buildSymmetricalNotch({ width: navWidth, centerX: cx, bottomCornerRadius });
  }, [activeIndex, navWidth, tabs.length, navMode, bottomCornerRadius]);

  const initialMaskUri = useMemo(
    () => svgPathToMaskDataUri(navWidth, 90, currentNotchD),
    [navWidth, currentNotchD]
  );

  const orbSize = activeTheme.orbSize || 46;
  const resolvedOrbBg =
    orbStyle === 'flat'
      ? activeTheme.orbFlatGradient || activeTheme.orbGradient
      : activeTheme.orbGradient;
  const resolvedOrbShadow =
    orbStyle === 'flat'
      ? activeTheme.orbFlatGlow || '0 6px 20px rgba(0, 0, 0, 0.38)'
      : activeTheme.orbGlow;

  return (
    <nav
      aria-label="Bottom Navigation"
      className={`relative w-full px-0 pb-[max(calc(env(safe-area-inset-bottom,0px)),0px)] z-30 shrink-0 select-none bg-transparent ${className}`}
      style={style}
    >
      <div ref={containerRef} className="relative w-full h-[90px] bg-transparent">
        {/* 1. Floating Circle / Orb */}
        <div
          ref={floatingOrbRef}
          style={{
            left: `${getTabCenterX(activeIndex, navWidth, tabs.length)}px`,
            top: '22px',
            width: `${orbSize}px`,
            height: `${orbSize}px`,
            transform: 'translate(-50%, -50%) scale(1, 1)',
            background: resolvedOrbBg,
            boxShadow: resolvedOrbShadow,
            opacity: navMode === 'pill' || !isReady ? 0 : 1,
          }}
          className="absolute rounded-full flex items-center justify-center pointer-events-none z-30 will-change-transform transition-[background,box-shadow,opacity] duration-300"
        >
          {/* 3D Specular Reflections (Only rendered when orbStyle === '3d') */}
          {orbStyle === '3d' && (
            <>
              <div
                style={{
                  backgroundColor: activeTheme.orbGlassHighlight || 'rgba(255, 255, 255, 0.42)',
                  transform: 'translateX(-50%)',
                }}
                className="absolute top-1 left-1/2 w-6 h-2.5 rounded-full blur-[1px]"
              />
              <div
                style={{
                  borderColor: activeTheme.orbRimGlow || 'rgba(255, 255, 255, 0.25)',
                }}
                className="absolute inset-[1px] rounded-full border pointer-events-none opacity-60"
              />
            </>
          )}
          {/* Active Tab Icon inside Circle/Orb */}
          <div
            ref={orbIconWrapRef}
            style={{ color: activeTheme.orbIconColor || '#FFFFFF' }}
            className="relative z-10 flex items-center justify-center will-change-transform [&>svg]:w-[21px] [&>svg]:h-[21px] [&>svg]:shrink-0"
          >
            {resolveTabIconNode(displayedOrbItem, {
              isActive: true,
              placement: 'orb',
              size: 21,
              strokeWidth: 2.2,
            })}
          </div>

          {/* Satellite Badge on Top-Right Rim of Floating Orb (Mode: 'orb-satellite') */}
          <div
            style={{
              opacity: activeOrbBadge !== undefined && !isTransitioning ? 1 : 0,
              transform:
                activeOrbBadge !== undefined && !isTransitioning
                  ? 'scale(1) translate(0px, 0px)'
                  : 'scale(0.35) translate(-6px, 6px)',
              backgroundColor: displayedOrbItem?.badgeColor || '#6366F1',
              borderColor: 'rgba(15, 15, 24, 0.85)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.28)',
              transition:
                'opacity 210ms cubic-bezier(0.16, 1, 0.3, 1), transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            className="absolute -top-1 -right-1.5 min-w-[19px] h-[19px] px-1.5 rounded-full border-[2px] text-[10px] font-bold text-white flex items-center justify-center z-40 tabular-nums pointer-events-none"
          >
            {activeOrbBadge}
          </div>
        </div>

        {/* 2. Sliding Pill Indicator (Now properly styled when navMode === 'pill') */}
        <div
          ref={slidingPillRef}
          style={{
            left: `${getTabCenterX(activeIndex, navWidth, tabs.length) - 32}px`,
            backgroundColor: activeTheme.pillBg || 'rgba(255, 255, 255, 0.14)',
            borderColor: activeTheme.pillBorder || 'rgba(255, 255, 255, 0.28)',
            boxShadow: activeTheme.pillGlow || '0 4px 16px rgba(0, 0, 0, 0.25)',
            opacity: navMode === 'pill' && isReady ? 1 : 0,
          }}
          className="sliding-pill absolute top-[30px] h-[52px] w-[64px] rounded-2xl border backdrop-blur-md pointer-events-none z-15 transition-opacity duration-200"
        />

        {/* 3. Hardware-Accelerated Backdrop Blur Layer via SVG Mask-Image */}
        <div
          ref={backdropMaskDivRef}
          style={{
            maskImage: initialMaskUri,
            WebkitMaskImage: initialMaskUri,
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            backdropFilter: `blur(${activeTheme.backdropBlur || '22px'})`,
            WebkitBackdropFilter: `blur(${activeTheme.backdropBlur || '22px'})`,
            backgroundColor: activeTheme.backdropBg || 'rgba(20, 16, 30, 0.35)',
          }}
          className="absolute inset-0 pointer-events-none z-[8] transition-colors duration-300"
        />

        {/* 4. Glass SVG with Gradient Fill & Specular Rim Border Stroke */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          viewBox={`0 0 ${navWidth} 90`}
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={glassGradId}
              x1="0"
              y1="22"
              x2="0"
              y2="90"
              gradientUnits="userSpaceOnUse"
            >
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
              <stop
                offset="50%"
                stopColor={activeTheme.glassStrokeMid || 'rgba(255, 255, 255, 0.16)'}
              />
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

        {/* 5. Interactive Tab Buttons (Accessible hitboxes + Keyboard support) */}
        <div
          role="tablist"
          aria-label="Навигационные вкладки"
          className="absolute inset-x-0 top-[22px] bottom-0 px-3 grid items-center z-20"
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
            '--nav-hover-color': activeTheme.inactiveHoverColor || '#FFFFFF',
          } as React.CSSProperties}
        >
          {tabs.map((tab, idx) => {
            const isActive = idx === activeIndex;
            const hasBadge =
              tab.badge !== undefined && tab.badge !== 0 && tab.badge !== '0';

            // In 'pill' mode, the active icon stays visible inside the sliding pill;
            // in 'notch' mode, the active icon lives inside the floating 3D orb above.
            const iconOpacity = navMode === 'pill' ? 1 : isActive ? 0 : 1;
            const iconTransform =
              navMode === 'pill'
                ? isActive
                  ? 'translateY(-6px) scale(1.06)'
                  : 'translateY(0px) scale(1)'
                : isActive
                  ? 'translateY(-10px) scale(0.65)'
                  : 'translateY(0px) scale(1)';

            // Critical fix: NEVER leave the inactive badge floating inside the empty notch cavity when isActive && navMode === 'notch'!
            const inactiveBadgeVisible =
              hasBadge && (navMode === 'pill' ? true : !isActive);

            const labelVisible =
              navMode === 'pill' ? isActive : isActive && !isTransitioning;
            const labelOpacity = labelVisible ? 1 : 0;
            const labelTransform = labelVisible ? 'translateY(0px)' : 'translateY(5px)';

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={
                  hasBadge ? `${tab.label} (${tab.badge} уведомлений)` : tab.label
                }
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  handleTabTrigger(tab.id, idx, e.timeStamp);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTabTrigger(tab.id, idx, e.timeStamp);
                  }
                }}
                onClick={(e) => {
                  if (e.detail === 0) {
                    handleTabTrigger(tab.id, idx, e.timeStamp);
                  }
                }}
                className="nav-tab-btn relative h-full min-h-[48px] flex flex-col items-center justify-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-xl"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Mechanical Resonance Wave on Tap */}
                {waveTarget && waveTarget.index === idx && (
                  <div
                    key={waveTarget.id}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                  >
                    <div
                      style={
                        {
                          borderColor: activeTheme.waveColor || '#FFFFFF',
                          '--wave-glow': activeTheme.waveColor || '#FFFFFF',
                        } as React.CSSProperties
                      }
                      className="absolute top-1/2 left-1/2 w-9 h-9 rounded-full border-2 animate-mech-wave pointer-events-none"
                    />
                    <div
                      style={{ borderColor: `${activeTheme.waveColor || '#FFFFFF'}88` }}
                      className="absolute top-1/2 left-1/2 w-9 h-9 rounded-full border animate-mech-echo pointer-events-none"
                    />
                  </div>
                )}

                {/* Tab Icon + Synchronized Inactive Badge */}
                <div className="relative flex items-center justify-center">
                  {hasBadge && (
                    <span
                      style={{
                        backgroundColor: tab.badgeColor || '#6366F1',
                        opacity: inactiveBadgeVisible ? 1 : 0,
                        transform: inactiveBadgeVisible
                          ? navMode === 'pill' && isActive
                            ? 'translateY(-6px) scale(1)'
                            : 'translateY(0px) scale(1)'
                          : 'translateY(-12px) scale(0.4)',
                        transition:
                          'opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      className="absolute -top-2 -right-3 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-md z-30 tabular-nums pointer-events-none"
                    >
                      {tab.badge}
                    </span>
                  )}

                  <div
                    style={{
                      opacity: iconOpacity,
                      transform: iconTransform,
                      color:
                        navMode === 'pill' && isActive
                          ? activeTheme.activeLabelColor || '#FFFFFF'
                          : activeTheme.inactiveColor || 'rgba(255, 255, 255, 0.56)',
                      transition:
                        'opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 220ms cubic-bezier(0.16, 1, 0.3, 1), color 160ms ease',
                    }}
                    className="tab-icon-wrap flex items-center justify-center group-hover:!text-[var(--nav-hover-color)] [&>svg]:w-[21px] [&>svg]:h-[21px] [&>svg]:shrink-0"
                  >
                    {resolveTabIconNode(tab, {
                      isActive,
                      placement: 'dock',
                      size: 21,
                      strokeWidth: isActive && navMode === 'pill' ? 2.3 : 2,
                    })}
                  </div>
                </div>

                {/* Active Tab Label (+ Optional Inline Badge when badgeBehavior === 'label-inline') */}
                {showLabels && (
                  <span
                    style={{
                      opacity: labelOpacity,
                      transform: labelTransform,
                      color: activeTheme.activeLabelColor || '#FFFFFF',
                      textShadow: activeTheme.activeLabelGlow,
                      transition:
                        'opacity 190ms cubic-bezier(0.16, 1, 0.3, 1), transform 190ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="tab-label absolute bottom-[7px] text-[10.5px] font-semibold pointer-events-none tracking-wide whitespace-nowrap flex items-center gap-1"
                  >
                    <span>{tab.label}</span>
                    {badgeBehavior === 'label-inline' && hasBadge && navMode === 'notch' && (
                      <span
                        style={{
                          backgroundColor: tab.badgeColor || '#6366F1',
                        }}
                        className="inline-flex items-center justify-center min-w-[15px] h-[14px] px-1 rounded-full text-[9px] font-bold text-white shadow-sm tabular-nums leading-none"
                      >
                        {tab.badge}
                      </span>
                    )}
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
