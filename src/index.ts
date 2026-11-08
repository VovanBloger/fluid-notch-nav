export {
  AdaptiveNotchNav,
  buildSymmetricalNotch,
  buildFlatPanel,
  getTabCenterX,
  THEME_PRESETS,
  DEFAULT_STANDARD_TABS,
} from './components/AdaptiveNotchNav';

export type {
  AdaptiveNotchNavProps,
  NavItem,
  NavAnimMode,
  NavThemePreset,
  NavThemeConfig,
} from './components/AdaptiveNotchNav';

export {
  triggerHaptic,
  triggerTabTouchHaptic,
  triggerTabLandingHaptic,
  cancelPendingHaptics,
  initTelegramMiniApp,
} from './lib/haptics';

export type {
  HapticType,
  HapticProfile,
  TelegramUserProfile,
} from './lib/haptics';
