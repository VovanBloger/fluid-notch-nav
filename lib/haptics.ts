export interface TelegramUserProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  photoUrl?: string;
  isPremium: boolean;
  languageCode: string;
  isFromTelegramWebApp: boolean;
}

interface TelegramHapticFeedback {
  selectionChanged?: () => void;
  notificationOccurred?: (type: 'success' | 'warning' | 'error') => void;
  impactOccurred?: (type: 'light' | 'medium' | 'heavy') => void;
}

interface TelegramWebAppWindow extends Window {
  Telegram?: {
    WebApp?: {
      ready?: () => void;
      expand?: () => void;
      initDataUnsafe?: {
        user?: {
          id?: number | string;
          first_name?: string;
          last_name?: string;
          username?: string;
          photo_url?: string;
          is_premium?: boolean;
          language_code?: string;
        };
      };
      HapticFeedback?: TelegramHapticFeedback;
    };
  };
  webkitAudioContext?: typeof AudioContext;
}

export function initTelegramMiniApp(): TelegramUserProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    const tg = (window as TelegramWebAppWindow).Telegram?.WebApp;
    if (tg) {
      tg.ready?.();
      tg.expand?.();

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
    // Fallback outside Telegram environment
  }

  return null;
}

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

export type HapticProfile = 'mechanical' | 'crisp' | 'soft' | 'none';

let pendingHapticTimers: ReturnType<typeof setTimeout>[] = [];
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioCtxClass =
        window.AudioContext || (window as TelegramWebAppWindow).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Synthesizes a subtle, crisp acoustic tactile click using Web Audio API for desktop preview.
 */
export function playSyntheticAudioTick(
  phase: 'launch' | 'echo' | 'land',
  profile: HapticProfile = 'mechanical'
) {
  if (profile === 'none') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const volumeScale = profile === 'soft' ? 0.55 : profile === 'crisp' ? 0.8 : 1.0;

    if (phase === 'launch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(1380, now + 0.016);
      gain.gain.setValueAtTime(0.05 * volumeScale, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    } else if (phase === 'echo') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.012);
      gain.gain.setValueAtTime(0.032 * volumeScale, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      osc.start(now);
      osc.stop(now + 0.015);
    } else {
      // 'land': deep magnetic pocket lock
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.034);
      gain.gain.setValueAtTime(0.11 * volumeScale, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
      osc.start(now);
      osc.stop(now + 0.038);
    }
  } catch {
    // Ignore audio context restrictions
  }
}

export function cancelPendingHaptics() {
  if (pendingHapticTimers.length > 0) {
    pendingHapticTimers.forEach((timer) => clearTimeout(timer));
    pendingHapticTimers = [];
  }
}

export function triggerHaptic(type: HapticType = 'light') {
  if (typeof window === 'undefined') return;

  try {
    window.dispatchEvent(new CustomEvent('tg:haptic', { detail: { type, timestamp: Date.now() } }));
  } catch {
    // Ignore custom event errors
  }

  // 1. Telegram WebApp HapticFeedback API
  try {
    const hf = (window as TelegramWebAppWindow).Telegram?.WebApp?.HapticFeedback;
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
  } catch {
    // Ignore Telegram WebApp errors
  }

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
  } catch {
    // Ignore vibrate permissions
  }
}

/**
 * Tab touch feedback: fired immediately on pointerdown / touchstart
 */
export function triggerTabTouchHaptic(
  profile: HapticProfile = 'mechanical',
  enableAudio: boolean = false
) {
  cancelPendingHaptics();
  if (profile === 'none') return;

  if (enableAudio) {
    playSyntheticAudioTick('launch', profile);
  }

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
    } catch {
      // Ignore
    }
  }

  const t1 = setTimeout(() => {
    triggerHaptic('selection');
    if (enableAudio) {
      playSyntheticAudioTick('echo', profile);
    }
  }, 45);
  pendingHapticTimers.push(t1);
}

/**
 * Tab landing feedback: fired precisely when the animation completes (t = 1)
 */
export function triggerTabLandingHaptic(
  profile: HapticProfile = 'mechanical',
  enableAudio: boolean = false
) {
  if (profile === 'none') return;
  if (enableAudio) {
    playSyntheticAudioTick('land', profile);
  }
  if (profile === 'soft') return;
  if (profile === 'crisp') {
    triggerHaptic('selection');
    return;
  }
  // 'mechanical': magnetic lock impact click
  triggerHaptic('medium');
}
