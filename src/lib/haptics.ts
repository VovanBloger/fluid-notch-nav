/**
 * Haptic feedback and Telegram WebApp integration utility
 */

export interface TelegramUserProfile {
  id: number;
  firstName: string;
  lastName?: string;
  username: string;
  photoUrl?: string;
  isPremium?: boolean;
  languageCode?: string;
  isFromTelegramWebApp: boolean;
}

export function initTelegramMiniApp(): TelegramUserProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready?.();
      tg.expand?.();
      tg.disableVerticalSwipes?.();
      if ('isVerticalSwipesEnabled' in tg) {
        tg.isVerticalSwipesEnabled = false;
      }
      tg.enableClosingConfirmation?.();

      const u = tg.initDataUnsafe?.user;
      if (u && u.id) {
        return {
          id: Number(u.id),
          firstName: u.first_name || 'User',
          lastName: u.last_name || '',
          username: u.username || `user_${u.id}`,
          photoUrl: u.photo_url || undefined,
          isPremium: Boolean(u.is_premium),
          languageCode: u.language_code || 'en',
          isFromTelegramWebApp: true,
        };
      }
    }
  } catch {
    // Fallback if outside Telegram
  }

  return null;
}

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';
export type HapticProfile = 'mechanical' | 'crisp' | 'soft' | 'none';

let pendingHapticTimers: any[] = [];

export function cancelPendingHaptics() {
  if (pendingHapticTimers.length > 0) {
    pendingHapticTimers.forEach((timer) => clearTimeout(timer));
    pendingHapticTimers = [];
  }
}

export function triggerHaptic(type: HapticType = 'light') {
  if (typeof window === 'undefined') return;

  // Dispatch custom event for visualizers or simulators
  try {
    window.dispatchEvent(new CustomEvent('tg:haptic', { detail: { type } }));
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'tg:haptic', detail: { type } }, '*');
    }
  } catch {}

  // 1. Telegram WebApp HapticFeedback API
  try {
    const hf = (window as any).Telegram?.WebApp?.HapticFeedback;
    if (hf) {
      if (type === 'selection') {
        hf.selectionChanged?.();
        return;
      }
      if (type === 'success' || type === 'warning' || type === 'error') {
        hf.notificationOccurred?.(type);
        return;
      }
      hf.impactOccurred?.(type);
      return;
    }
  } catch {}

  // 2. Mobile Browser Navigator Vibrate API
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const duration =
        type === 'selection'
          ? 6
          : type === 'light'
            ? 10
            : type === 'medium'
              ? 18
              : type === 'success'
                ? [12, 35, 18]
                : 25;
      navigator.vibrate(duration);
    }
  } catch {}
}

/**
 * Tab touch feedback: fired immediately on pointerdown / touchstart
 */
export function triggerTabTouchHaptic(profile: HapticProfile = 'mechanical') {
  cancelPendingHaptics();

  if (profile === 'none') return;

  if (profile === 'soft') {
    triggerHaptic('light');
    return;
  }

  if (profile === 'crisp') {
    triggerHaptic('selection');
    return;
  }

  // 'mechanical': double impulse (takeoff)
  triggerHaptic('light');

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([10, 45, 14]);
    } catch {}
  }

  const t1 = setTimeout(() => {
    triggerHaptic('selection');
  }, 45);
  pendingHapticTimers.push(t1);
}

/**
 * Tab landing feedback: fired precisely when the animation completes (t = 1)
 */
export function triggerTabLandingHaptic(profile: HapticProfile = 'mechanical') {
  if (profile === 'none' || profile === 'soft') return;

  if (profile === 'crisp') {
    triggerHaptic('selection');
    return;
  }

  // 'mechanical': magnetic lock impact click
  triggerHaptic('medium');
}
